load("pixiv.js");

function execute(url) {
    if ((url || "").indexOf("pixiv-novel:") === 0) {
        var novelId = url.split(":")[1];
        var detail = getNovelDetailById(novelId);
        if (!detail) return null;
        return Response.success([
            {
                name: detail.title || "Chapter 1",
                url: BASE_URL + "/novel/show.php?id=" + novelId
            }
        ]);
    }

    if ((url || "").indexOf("pixiv-series:") === 0) {
        var parts = url.split(":");
        var seriesId = parts[1];
        var offset = parts[2] || "0";
        var body = getSeriesContentByOffset(seriesId, offset);
        if (!body) return null;
        var items = body.seriesContents || (body.thumbnails && body.thumbnails.novel) || [];
        return Response.success(items.map(function (item) {
            return {
                name: item.title || "",
                url: BASE_URL + "/novel/show.php?id=" + item.id
            };
        }));
    }

    var seriesId = parseSeriesId(url);
    if (seriesId) {
        var body = getSeriesContentByOffset(seriesId, 0);
        if (!body) return null;
        var seriesItems = body.seriesContents || (body.thumbnails && body.thumbnails.novel) || [];
        return Response.success(seriesItems.map(function (item) {
            return {
                name: item.title || "",
                url: BASE_URL + "/novel/show.php?id=" + item.id
            };
        }));
    }

    var novelId = parseNovelId(url);
    if (!novelId) return null;
    var detail = getNovelDetailById(novelId);
    if (!detail) return null;

    if (detail.seriesNavData && detail.seriesNavData.seriesId) {
        var listBody = getSeriesContentByOffset(String(detail.seriesNavData.seriesId), 0);
        if (!listBody) return null;
        var listItems = listBody.seriesContents || (listBody.thumbnails && listBody.thumbnails.novel) || [];
        return Response.success(listItems.map(function (item) {
            return {
                name: item.title || "",
                url: BASE_URL + "/novel/show.php?id=" + item.id
            };
        }));
    }

    return Response.success([
        {
            name: detail.title || "Chapter 1",
            url: BASE_URL + "/novel/show.php?id=" + novelId
        }
    ]);
}
