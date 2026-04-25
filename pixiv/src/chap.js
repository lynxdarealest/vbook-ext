load("pixiv.js");

function execute(url) {
    var novelId = parseNovelId(url);
    if (!novelId) return null;

    var detail = fetchJson(BASE_URL + "/ajax/novel/" + novelId, BASE_URL + "/novel/show.php?id=" + novelId);
    if (!detail) return null;

    return Response.success(renderContentHtml(detail));
}
