import { MessageTypes } from "@/enum/MessageTypes";
import {
  AudioInput,
  AutomaticSpeechRecognitionPipeline,
  Chunk,
  ChunkCallbackItem,
  pipeline,
  PipelineType,
} from "@xenova/transformers";

interface BeamOutput {
  output_token_ids: number[];
}

interface ProcessedChunk {
  index: number;
  text: string;
  start: number;
  end: number;
}

interface PartialResult {
  text: string;
  start: number;
  end?: number;
}

class MyTrancriptionPipeline {
  static task: PipelineType = "automatic-speech-recognition";
  static model = "openai/whisper-tiny.en";
  static instance: AutomaticSpeechRecognitionPipeline | null = null;

  static async getInstance(
    progress_callback?: ProgressCallback
  ): Promise<AutomaticSpeechRecognitionPipeline> {
    if (this.instance === null) {
      // Load the model if it is not loaded before
      this.instance = (await pipeline(this.task, undefined, {
        progress_callback: progress_callback || undefined, // Report progress while model is loading
      })) as AutomaticSpeechRecognitionPipeline;
    }
    return this.instance;
  }
}

// Web Worker's Message Listener
self.addEventListener("message", async (event) => {
  const { type, audio } = event.data;
  if (type === MessageTypes.INFERENCE_DONE) {
    await transcribe(audio);
  }
});

// Transcribe Function Converts Audio File to Text
async function transcribe(audio: AudioInput[] ):Promise<void> {
  sendLoadingMessage("loading");

  let pipelineInstance: AutomaticSpeechRecognitionPipeline;

  try {
    pipelineInstance = await MyTrancriptionPipeline.getInstance(loadModelCallback);
   } catch (err) {
      if (err instanceof Error) {
          console.log(err.message);
      } else {
          console.log("An unknown error occurred");
      }
      return;
  }
  sendLoadingMessage("success");

  const stride_length_s = 5;

  const generationTracker = new GenerationTracker(pipelineInstance, stride_length_s);
  await pipelineInstance(audio, {
    top_k: 0, //Closes the word prediction pool, allowing the model to make its best guess on the transcript.
    do_sample: false, //No sampling (random selection) is done, the model always chooses the most likely prediction.
    chunk_length_s: 30, //The audio recording is split into 30-second segments, so the model processes one 30-second section at a time.
    stride_length_s, //The recording provides 5 seconds of overlap between tracks (the value was set to 5). This prevents word loss.
    return_timestamps: true, //It allows the transcribed words to come with timestamps, so the duration of each word in the audio recording can be determined.
    chunk_callback: generationTracker.chunkCallback.bind(generationTracker), //Each time a chunk is processed, it runs the generationTracker.chunkCallback function.
    //: generationTracker.callbackFunction.bind(generationTracker), //As results are received, it calls the generationTracker.callbackFunction function.
  });

  // Why Use 30 Second Chunks?
  // Memory Usage: Processing long audio files can consume a lot of RAM. Memory management is done by splitting them into chunks.
  // Bug Fix: With stride_length_s: 5, chunks are processed with 5 seconds of overlap. This way, words are not clipped or skipped.
  // Quick Response: Instead of processing the entire audio, it is faster to get output instantly as each 30-second chunk is completed.

  // Summary
  // The audio file is fed to the model.
  // It is processed by splitting it into 30-second chunks.
  // A 5-second overlap is added to each chunk (for a seamless transcript).
  // The results are returned instantly and timestamps are recorded.
  // The final transcript is sent when the process is complete.
  generationTracker.sendFinalResult();
}


//Callback to Show Progress While Loading the Model
async function loadModelCallback(data:{ status: string; file?: string; progress?: number; loaded?: number; total?: number }) {
  const { status, file, progress, loaded, total } = data;
  if (status === "progress" && file !== undefined && progress !== undefined && loaded !== undefined && total !== undefined) {
    sendDownloadingMessage(file, progress, loaded, total);
  }
}


// Functions that Send Messages to Web Worker
function sendLoadingMessage(status:string) {
  self.postMessage({
      type: MessageTypes.LOADING,
      status
  })
}

async function sendDownloadingMessage(file:string, progress:number, loaded:number, total:number) {
  self.postMessage({
      type: MessageTypes.DOWNLOADING,
      file,
      progress,
      loaded,
      total
  })
}

class GenerationTracker {
  private pipeline: AutomaticSpeechRecognitionPipeline;
  private stride_length_s: number;
  private chunks: ChunkCallbackItem[] = [];
  private time_precision: number;
  private processed_chunks: ProcessedChunk[] = [];
  private callbackFunctionCounter = 0;

  constructor(pipeline:AutomaticSpeechRecognitionPipeline, stride_length_s:number) {
      this.pipeline = pipeline
      this.stride_length_s = stride_length_s
      this.chunks = []
      this.time_precision = pipeline?.processor.feature_extractor.config.chunk_length / pipeline.model.config.max_source_positions
      this.processed_chunks = []
      this.callbackFunctionCounter = 0
  }

  sendFinalResult() {
      self.postMessage({ type: MessageTypes.INFERENCE_DONE })
  }

  callbackFunction(beams:BeamOutput[]) {
      this.callbackFunctionCounter += 1
      if (this.callbackFunctionCounter % 10 !== 0) {
          return
      }

      const bestBeam = beams[0]
      const text = this.pipeline.tokenizer.decode(bestBeam.output_token_ids, {
          skip_special_tokens: true
      })

      const result = {
          text,
          start: this.getLastChunkTimestamp(),
          end: undefined
      }

      createPartialResultMessage(result)
  }

  chunkCallback(data:ChunkCallbackItem) {
      this.chunks.push(data)
      const [{ chunks }]:{ chunks: Chunk[] }[] = (this.pipeline.tokenizer as any)._decode_asr(
          this.chunks,
          {
              time_precision: this.time_precision,
              return_timestamps: true,
              force_full_sequence: false
          }
      )

      this.processed_chunks = chunks.map((chunk:Chunk, index:number) => {
          return this.processChunk(chunk, index)
      })


      createResultMessage(
          this.processed_chunks, false, this.getLastChunkTimestamp()
      )
  }

  getLastChunkTimestamp() {
    return this.processed_chunks.length === 0 ? 0 : this.processed_chunks[this.processed_chunks.length - 1].end
  }

  processChunk(chunk: Chunk, index: number) {
      const { text, timestamp } = chunk
      const [start, end] = timestamp

      return {
          index,
          text: `${text.trim()}`,
          start: Math.round(start),
          end: Math.round(end) || Math.round(start + 0.9 * this.stride_length_s)
      }

  }
}

function createResultMessage(results: PartialResult[], isDone: boolean, completedUntilTimestamp: number) {
  self.postMessage({
      type: MessageTypes.RESULT,
      results,
      isDone,
      completedUntilTimestamp
  })
}

function createPartialResultMessage(result: PartialResult) {
  self.postMessage({
      type: MessageTypes.RESULT_PARTIAL,
      result
  })
}