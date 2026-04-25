load("pixiv.js");

function execute(seriesId) {
    var body = fetchJson(
        BASE_URL + "/ajax/novel/series_content/" + seriesId + "?limit=30&last_order=0&order_by=asc&lang=en",
        BASE_URL + "/novel/series/" + seriesId
    );
    if (!body || !body.thumbnails || !body.thumbnails.novel) return null;

    var data = [];
    body.thumbnails.novel.forEach(function (item) {
        if (!item || !item.id) return;
        data.push({
            name: item.title || "",
            link: BASE_URL + "/novel/show.php?id=" + item.id,
            cover: item.url || "",
            description: item.userName || "",
            host: BASE_URL
        });
    });
    return Response.success(data);
}
