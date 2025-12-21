import { buildGraph } from "../service/ServiceGraph/grapBuilder";
import { buildResults } from "../service/ServiceGraph/resultsBuilder";
import { filter } from "../service/ServiceGraph/resultsFilter";
import { promises as fs } from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "public", "train-ticket-be.json");
const jsonString = await fs.readFile(filePath, "utf-8");
const graph = buildGraph(jsonString);

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const queryParams = url.searchParams.get("query");
        const filtered = filter(graph, queryParams);
        return new Response(JSON.stringify({
            status: "success",
            result: buildResults(filtered)
        }), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        return new Response(JSON.stringify({ status: "error", result: (error as Error).message }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}