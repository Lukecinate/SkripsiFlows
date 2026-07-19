import dynamic from "next/dynamic";

const EditorPage = dynamic(() => import("./EditorPage"));

export default EditorPage;
