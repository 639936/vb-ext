
function execute(url) { // url từ detail.js
    var data = [];
    
    data.push({
        name: "Không có thao tác nào thêm.",
        url: "info/no_action" 
    });
    data.push({
        name: "Để xóa key này, hãy dùng chức năng tìm kiếm.",
        url: "info/use_search_to_delete"
    });

    return Response.success(data);
}