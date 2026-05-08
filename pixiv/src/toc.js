load("pixiv.js");

function getAllSeriesContents(seriesId) {
    var all = [];
    var seen = {};
    var offset = 0;
    var limit = SERIES_PAGE_SIZE || 30;

    while (true) {
        var body = getSeriesContentByOffset(seriesId, offset);
        if (!body) break;

        var items = [];

        if (body.seriesContents && body.seriesContents.length) {
            items = body.seriesContents;
        } else if (body.thumbnails && body.thumbnails.novel && body.thumbnails.novel.length) {
            items = body.thumbnails.novel;
        }

        if (!items.length) break;

        var added = 0;

        items.forEach(function (item) {
            if (!item || !item.id) return;

            var id = String(item.id);
            if (seen[id]) return;

            seen[id] = true;
            all.push(item);
            added++;
        });

        if (items.length < limit) break;

        offset += limit;

        // Chặn vòng lặp vô hạn nếu Pixiv trả lại cùng 1 page dù offset đổi
        if (added === 0) break;
    }

    return all;
}

function mapTocItems(items) {
    return items.map(function (item) {
        return {
            name: item.title || "",
            url: BASE_URL + "/novel/show.php?id=" + item.id
        };
    });
}

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
        var seriesIdFromInput = parts[1];

        if (!seriesIdFromInput) return null;

        return Response.success(
            mapTocItems(getAllSeriesContents(seriesIdFromInput))
        );
    }

    var seriesId = parseSeriesId(url);

    if (seriesId) {
        return Response.success(
            mapTocItems(getAllSeriesContents(seriesId))
        );
    }

    var novelIdFromUrl = parseNovelId(url);

    if (!novelIdFromUrl) return null;

    var detailFromNovel = getNovelDetailById(novelIdFromUrl);

    if (!detailFromNovel) return null;

    if (detailFromNovel.seriesNavData && detailFromNovel.seriesNavData.seriesId) {
        return Response.success(
            mapTocItems(getAllSeriesContents(String(detailFromNovel.seriesNavData.seriesId)))
        );
    }

    return Response.success([
        {
            name: detailFromNovel.title || "Chapter 1",
            url: BASE_URL + "/novel/show.php?id=" + novelIdFromUrl
        }
    ]);
}
