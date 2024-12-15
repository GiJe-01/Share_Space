// Password verification
function verifyPassword() {
    const password = document.getElementById('password').value;
    if (password === 'your_password') { // ここにパスワードを設定してください
        document.getElementById('password-prompt').style.display = 'none';
        document.getElementById('main-content').style.display = 'block';
        generateUniqueID();
        displayThreads();
        displayPosts(document.getElementById('current-thread-title').textContent);
    } else {
        alert('パスワードが違います');
    }
}

// Unique ID generation
function generateUniqueID() {
    const uniqueID = Math.random().toString(36).substring(2, 7);
    sessionStorage.setItem('uniqueID', uniqueID);
}

// Create a new thread
function createThread() {
    const threadName = prompt('スレッド名を入力してください');
    if (threadName) {
        const threadList = document.getElementById('thread-list');
        const li = document.createElement('li');
        li.textContent = threadName;
        li.onclick = function() { selectThread(threadName) };
        threadList.appendChild(li);
    }
}

// Display threads
function displayThreads() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const threadList = document.getElementById('thread-list');
    const threads = [...new Set(posts.map(post => post.thread).filter(thread => thread !== null))];
    threads.forEach(thread => {
        if (![...threadList.children].some(li => li.textContent === thread)) {
            const li = document.createElement('li');
            li.textContent = thread;
            li.onclick = function() { selectThread(thread) };
            threadList.appendChild(li);
        }
    });
}

// Select a thread
function selectThread(threadName) {
    document.getElementById('current-thread-title').textContent = threadName;
    displayPosts(threadName);
}

// Post a new message
function postMessage(replyTo = null) {
    const postContent = document.getElementById('new-post').value;
    if (postContent) {
        const threadName = document.getElementById('current-thread-title').textContent;
        const uniqueID = sessionStorage.getItem('uniqueID');
        const post = {
            content: postContent,
            author: uniqueID,
            date: new Date().toLocaleString(),
            thread: threadName !== 'トップ' ? threadName : null,
            replyTo: replyTo
        };
        savePost(post);
        displayPosts(threadName);
        displayThreads();
        document.getElementById('new-post').value = '';
    }
}

// Save a post
function savePost(post) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    posts.push(post);
    localStorage.setItem('posts', JSON.stringify(posts));
}

// Display posts
function displayPosts(threadName) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const filteredPosts = posts.filter(post => post.thread === threadName || (threadName === 'トップ' && !post.thread));
    const postsDiv = document.getElementById('posts');
    postsDiv.innerHTML = '';
    filteredPosts.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <p>${post.content}</p>
            <small>投稿者: ${post.author}, 投稿日時: ${post.date}</small>
            <button onclick="replyToPost('${post.author}')">返信</button>
            <button onclick="deletePost('${post.date}')">削除</button>
        `;
        postsDiv.appendChild(postDiv);
    });
}

// Reply to a post
function replyToPost(author) {
    const replyContent = `>>>${author} `;
    document.getElementById('new-post').value = replyContent;
}

// Delete a post
function deletePost(date) {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const newPosts = posts.filter(post => post.date !== date);
    localStorage.setItem('posts', JSON.stringify(newPosts));
    displayPosts(document.getElementById('current-thread-title').textContent);
    checkThreadDeletion();
}

// Check for thread deletion
function checkThreadDeletion() {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const threadList = document.getElementById('thread-list');
    const threads = [...threadList.children].map(li => li.textContent);
    threads.forEach(thread => {
        if (thread !== 'トップ' && !posts.some(post => post.thread === thread)) {
            const threadItem = [...threadList.children].find(li => li.textContent === thread);
            threadList.removeChild(threadItem);
        }
    });
}

// Set post expiration
setInterval(() => {
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const now = new Date().getTime();
    const newPosts = posts.filter(post => {
        const postTime = new Date(post.date).getTime();
        return (now - postTime) < 48 * 60 * 60 * 1000; // 48時間以内の投稿
    });
    localStorage.setItem('posts', JSON.stringify(newPosts));
    displayPosts(document.getElementById('current-thread-title').textContent);
    checkThreadDeletion();
    displayThreads();
}, 60 * 1000); // 1分ごとにチェック

