import { exportPdf } from "../export-pdf";
import { createWorkerHandler } from "../worker-utils";

createWorkerHandler({
  exportPdf: function(args) {
    var document = args[0];
    var filename = args[1];
    return exportPdf(document, filename);
  },
});
