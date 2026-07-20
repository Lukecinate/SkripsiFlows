import { ingestSource } from "../ingestion";
import { createWorkerHandler } from "../worker-utils";

createWorkerHandler({
  ingest: function(args) {
    var input = args[0];
    return ingestSource(input);
  },
});
