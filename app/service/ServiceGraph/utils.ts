import { promises as fs } from "fs";
import path from "path";
import { buildGraph } from "./grapBuilder";

let graph: Map<string, any>;

export async function getGraph(){
    if(graph) return graph;
    graph = await loadGraph();
    return graph;
}

async function loadGraph(){
    const filePath = path.join(process.cwd(), "public", "train-ticket-be.json");
    const jsonString = await fs.readFile(filePath, "utf-8");
    const graph = buildGraph(jsonString);
    return graph;
}