import { exportDocx } from "../export-docx";
import { createWorkerHandler } from "../worker-utils";

createWorkerHandler({
  exportDocx: function(args) {
    var document = args[0];
    var filename = args[1];
    return exportDocx(document, filename);
  },
});
