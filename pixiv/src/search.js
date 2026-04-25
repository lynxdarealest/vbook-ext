load("pixiv.js");

function execute(key, page) {
    var result = getSearchResult(key, page || "1");
    return Response.success(result.items.map(normalizeNovelCard), result.next);
}
