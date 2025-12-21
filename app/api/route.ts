import { buildResults } from "../service/ServiceGraph/resultsBuilder";
import { filter } from "../service/ServiceGraph/resultsFilter";
import { getGraph } from "../service/ServiceGraph/utils";

export async function GET(request: Request) {
    try {
        const url = new URL(request.url);
        const queryParams = url.searchParams.get("query");
        const filtered = filter(await getGraph(), queryParams);
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