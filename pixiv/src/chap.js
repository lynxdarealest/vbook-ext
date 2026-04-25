load("pixiv.js");

function execute(url) {
    var novelId = parseNovelId(url);
    if (!novelId) return null;
    var detail = getNovelDetailById(novelId);
    if (!detail) return null;
    return Response.success(renderContentHtml(detail));
}
