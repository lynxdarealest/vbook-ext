load("pixiv.js");

function execute(url) {
    var novelId = parseNovelId(url);
    if (!novelId) return null;

    var detail = fetchJson(BASE_URL + "/ajax/novel/" + novelId, BASE_URL + "/novel/show.php?id=" + novelId);
    if (!detail) return null;

    var genres = [];
    var tags = detail.tags && detail.tags.tags ? detail.tags.tags : [];
    tags.forEach(function (entry) {
        if (!entry || !entry.tag) return;
        genres.push({
            title: entry.tag,
            input: encodeURIComponent(entry.tag),
            script: "gen.js"
        });
    });

    var suggests = [];
    if (detail.seriesNavData && detail.seriesNavData.seriesId) {
        suggests.push({
            title: detail.seriesNavData.title || "Series",
            input: detail.seriesNavData.seriesId,
            script: "suggest.js"
        });
    }

    return Response.success({
        name: detail.title || "",
        cover: detail.coverUrl || "",
        author: detail.userName || "",
        description: (detail.createDate || "") + "<br/>View: " + (detail.viewCount || 0) + "<br/>" + (detail.description || ""),
        suggests: suggests,
        genres: genres,
        detail: "Tac gia: " + (detail.userName || ""),
        host: BASE_URL
    });
}
