const API_POSTS = 'http://localhost:3000/posts';
const API_COMMENTS = 'http://localhost:3000/comments';

async function Load() {
    try {
        let res = await fetch(API_POSTS);
        let data = await res.json();
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        
        data.forEach(post => {
            const style = post.isDeleted ? 'style="text-decoration: line-through; color: gray;"' : '';
            const actionBtn = post.isDeleted 
                ? `<button disabled>Deleted</button>` 
                : `<input value="Delete" type="button" onclick="SoftDelete('${post.id}')" />`;

            body.innerHTML += `
            <tr ${style}>
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    <button onclick="EditPost('${post.id}')">Edit</button>
                    ${actionBtn}
                </td>
            </tr>`;
        });
    } catch (error) {
        console.error("Lỗi load dữ liệu:", error);
    }
}

async function Save() {
    let id = document.getElementById("id_txt").value;
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;

    if (id) {
        await fetch(`${API_POSTS}/${id}`, {
            method: 'PUT',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, views, isDeleted: false })
        });
    } else {
        let resAll = await fetch(API_POSTS);
        let allPosts = await resAll.json();      
        let maxId = allPosts.length > 0 ? Math.max(...allPosts.map(p => parseInt(p.id))) : 0;
        let newId = (maxId + 1).toString();

        await fetch(API_POSTS, {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: newId, title, views, isDeleted: false })
        });
    }
    resetForm();
    Load();
}

async function SoftDelete(id) {
    await fetch(`${API_POSTS}/${id}`, {
        method: 'PATCH',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeleted: true })
    });
    Load();
}

async function EditPost(id) {
    let res = await fetch(`${API_POSTS}/${id}`);
    let post = await res.json();
    document.getElementById("id_txt").value = post.id;
    document.getElementById("title_txt").value = post.title;
    document.getElementById("views_txt").value = post.views;
}

function resetForm() {
    document.getElementById("id_txt").value = "";
    document.getElementById("title_txt").value = "";
    document.getElementById("views_txt").value = "";
}

async function LoadComments() {
    let res = await fetch(API_COMMENTS);
    let data = await res.json();
    let list = document.getElementById("comment-list");
    list.innerHTML = data.map(c => `
        <li>
            PostID: ${c.postId} - ${c.text} 
            <button onclick="DeleteComment('${c.id}')">Xóa</button>
        </li>
    `).join('');
}

async function AddComment() {
    let postId = document.getElementById("cmt_post_id").value;
    let text = document.getElementById("cmt_text").value;
    
    let resAll = await fetch(API_COMMENTS);
    let allCmts = await resAll.json();
    let maxId = allCmts.length > 0 ? Math.max(...allCmts.map(c => parseInt(c.id))) : 0;

    await fetch(API_COMMENTS, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: (maxId + 1).toString(), text, postId })
    });
    LoadComments();
}

async function DeleteComment(id) {
    await fetch(`${API_COMMENTS}/${id}`, { method: 'DELETE' });
    LoadComments();
}

Load();
LoadComments();