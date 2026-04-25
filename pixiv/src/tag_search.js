load("pixiv.js");

function execute(tag, page) {
    var result = getSearchResult(tag, page || "1");
    return Response.success(result.items.map(normalizeNovelCard), result.next);
}
