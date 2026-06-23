(function() {
    // ============================================
    // DATA STORE
    // ============================================
    const currentUser = {
        id: 'user1',
        name: 'M Waqas',
        bio: 'Software Developer | Music Lover',
        avatar: '👤',
        friends: ['user2', 'user3'],
        online: true
    };

    // Friend requests: { from: userId, to: userId, status: 'pending'|'accepted'|'rejected' }
    let friendRequests = [
        { from: 'user4', to: 'user1', status: 'pending' },
        { from: 'user5', to: 'user1', status: 'pending' }
    ];

    // All users (simulated)
    const users = {
        'user1': { id: 'user1', name: 'M Waqas', bio: 'Software Developer | Music Lover', avatar: '👤', online: true },
        'user2': { id: 'user2', name: 'M Samar', bio: 'UI/UX Designer', avatar: '👩', online: true },
        'user3': { id: 'user3', name: 'Jawad Ali', bio: 'Product Manager', avatar: '🧑', online: false },
        'user4': { id: 'user4', name: 'Qasim Ali', bio: 'Data Scientist', avatar: '👩‍💻', online: true },
        'user5': { id: 'user5', name: 'Asim Ali', bio: 'DevOps Engineer', avatar: '🧑‍💻', online: false },
        'user6': { id: 'user6', name: 'Shahmeer', bio: 'Marketing Lead', avatar: '👩‍💼', online: true }
    };

    // Posts
    let posts = [
        {
            id: 'p1',
            userId: 'user1',
            content: 'Just launched our new social network! 🚀 Excited to connect with everyone.',
            image: null,
            timestamp: Date.now() - 3600000,
            likes: ['user2', 'user3'],
            comments: [
                { userId: 'user2', text: 'Congrats! Looks amazing!', timestamp: Date.now() - 1800000 },
                { userId: 'user3', text: 'Great work! 👏', timestamp: Date.now() - 900000 }
            ]
        },
        {
            id: 'p2',
            userId: 'user2',
            content: 'Working on a new design system. Here\'s a sneak peek! 🎨',
            image: null,
            timestamp: Date.now() - 7200000,
            likes: ['user1'],
            comments: [
                { userId: 'user1', text: 'Love the colors!', timestamp: Date.now() - 3600000 }
            ]
        },
        {
            id: 'p3',
            userId: 'user4',
            content: 'Just finished a great book on machine learning. Highly recommend! 📚',
            image: null,
            timestamp: Date.now() - 10800000,
            likes: [],
            comments: []
        }
    ];

    let notifications = [
        { id: 'n1', userId: 'user1', message: 'M Samar liked your post', timestamp: Date.now() - 1800000, read: false },
        { id: 'n2', userId: 'user1', message: 'Jawad ALi commented on your post', timestamp: Date.now() - 3600000, read: false },
        { id: 'n3', userId: 'user1', message: 'Qasim Ali sent you a friend request', timestamp: Date.now() - 7200000, read: false }
    ];

    let postIdCounter = 4;
    let notificationIdCounter = 4;

    // ============================================
    // DOM REFS
    // ============================================
    const views = {
        feed: document.getElementById('feedView'),
        profile: document.getElementById('profileView'),
        friends: document.getElementById('friendsView'),
        notifications: document.getElementById('notificationsView')
    };

    const navBtns = document.querySelectorAll('.nav-btn');
    const postsContainer = document.getElementById('postsContainer');
    const postInput = document.getElementById('postInput');
    const submitPostBtn = document.getElementById('submitPostBtn');
    const imageUploadBtn = document.getElementById('imageUploadBtn');
    const imageUpload = document.getElementById('imageUpload');
    const profilePosts = document.getElementById('profilePosts');
    const friendRequestsContainer = document.getElementById('friendRequestsContainer');
    const friendsListContainer = document.getElementById('friendsListContainer');
    const notificationsContainer = document.getElementById('notificationsContainer');
    const onlineUsersContainer = document.getElementById('onlineUsersContainer');
    const notificationBadge = document.getElementById('notificationBadge');
    const currentUserName = document.getElementById('currentUserName');
    const currentUserStatus = document.getElementById('currentUserStatus');
    const profileName = document.getElementById('profileName');
    const profileBio = document.getElementById('profileBio');
    const profilePostsCount = document.getElementById('profilePostsCount');
    const profileFriendsCount = document.getElementById('profileFriendsCount');
    const editProfileBtn = document.getElementById('editProfileBtn');
    const editProfileModal = document.getElementById('editProfileModal');
    const editName = document.getElementById('editName');
    const editBio = document.getElementById('editBio');
    const saveProfileBtn = document.getElementById('saveProfileBtn');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const newPostBtn = document.getElementById('newPostBtn');
    const createPostArea = document.getElementById('createPostArea');

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    function formatTime(timestamp) {
        const diff = Date.now() - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        return `${days}d ago`;
    }

    function getUser(id) {
        return users[id] || { id, name: 'Unknown User', avatar: '👤' };
    }

    function generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
    }

    // ============================================
    // DELETE POST FUNCTION
    // ============================================
    function deletePost(postId) {
        // Find the post
        const postIndex = posts.findIndex(p => p.id === postId);
        if (postIndex === -1) return;

        const post = posts[postIndex];
        
        // Only allow deletion if current user is the author
        if (post.userId !== currentUser.id) {
            alert('You can only delete your own posts!');
            return;
        }

        // Confirm deletion
        if (!confirm('Are you sure you want to delete this post?')) {
            return;
        }

        // Remove the post
        posts.splice(postIndex, 1);

        // Add notification for deletion (optional)
        notifications.push({
            id: 'n' + notificationIdCounter++,
            userId: currentUser.id,
            message: `You deleted a post: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
            timestamp: Date.now(),
            read: false
        });

        // Re-render everything
        renderAll();
        
        // Show feedback
        showToast('Post deleted successfully!');
    }

    // ============================================
    // TOAST NOTIFICATION
    // ============================================
    function showToast(message) {
        // Remove existing toast
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.innerHTML = `
            <i class="fas fa-check-circle" style="color:#4ade80;"></i>
            <span>${message}</span>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #1e2128;
            color: #e4e6eb;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            border-left: 4px solid #4ade80;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 12px;
            animation: slideIn 0.3s ease;
            font-size: 0.95rem;
            max-width: 400px;
        `;
        document.body.appendChild(toast);

        // Auto remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Add animation styles
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);

    // ============================================
    // RENDER FUNCTIONS
    // ============================================
    function renderPosts() {
        const sortedPosts = [...posts].sort((a, b) => b.timestamp - a.timestamp);
        postsContainer.innerHTML = sortedPosts.map(post => {
            const user = getUser(post.userId);
            const isLiked = post.likes.includes(currentUser.id);
            const isAuthor = post.userId === currentUser.id;
            
            return `
                <div class="post-card" data-post-id="${post.id}">
                    <div class="post-header">
                        <div class="avatar-small">${user.avatar}</div>
                        <div style="flex:1;">
                            <div class="post-user">${user.name}</div>
                            <div class="post-time">${formatTime(post.timestamp)}</div>
                        </div>
                        ${isAuthor ? `
                            <button class="delete-post-btn" data-post-id="${post.id}" title="Delete post">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                    <div class="post-content">${post.content}</div>
                    ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" />` : ''}
                    <div class="post-actions-bar">
                        <button class="like-btn ${isLiked ? 'liked' : ''}" data-post-id="${post.id}">
                            <i class="${isLiked ? 'fas' : 'far'} fa-heart"></i>
                            <span>${post.likes.length}</span>
                        </button>
                        <button class="comment-toggle" data-post-id="${post.id}">
                            <i class="far fa-comment"></i>
                            <span>${post.comments.length}</span>
                        </button>
                    </div>
                    <div class="comments-section" id="comments-${post.id}">
                        ${post.comments.map(comment => `
                            <div class="comment">
                                <div class="avatar-small" style="font-size:1rem;width:28px;height:28px;">${getUser(comment.userId).avatar}</div>
                                <div>
                                    <div class="comment-user">${getUser(comment.userId).name}</div>
                                    <div class="comment-text">${comment.text}</div>
                                </div>
                            </div>
                        `).join('')}
                        <div class="comment-input-area">
                            <input type="text" placeholder="Write a comment..." class="comment-input" data-post-id="${post.id}" />
                            <button class="comment-submit" data-post-id="${post.id}">Post</button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Attach event listeners for likes
        document.querySelectorAll('.like-btn').forEach(btn => {
            btn.addEventListener('click', handleLike);
        });

        // Attach event listeners for comments
        document.querySelectorAll('.comment-submit').forEach(btn => {
            btn.addEventListener('click', handleCommentSubmit);
        });

        document.querySelectorAll('.comment-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const postId = input.dataset.postId;
                    const submitBtn = document.querySelector(`.comment-submit[data-post-id="${postId}"]`);
                    if (submitBtn) submitBtn.click();
                }
            });
        });

        // Attach event listeners for delete buttons
        document.querySelectorAll('.delete-post-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const postId = this.dataset.postId;
                deletePost(postId);
            });
        });
    }

    function renderProfile() {
        profileName.textContent = currentUser.name;
        profileBio.textContent = currentUser.bio;
        const userPosts = posts.filter(p => p.userId === currentUser.id);
        profilePostsCount.textContent = userPosts.length;
        profileFriendsCount.textContent = currentUser.friends.length;

        profilePosts.innerHTML = userPosts.length > 0 ? userPosts.map(post => `
            <div class="post-card">
                <div class="post-header">
                    <div class="avatar-small">${currentUser.avatar}</div>
                    <div style="flex:1;">
                        <div class="post-user">${currentUser.name}</div>
                        <div class="post-time">${formatTime(post.timestamp)}</div>
                    </div>
                    <button class="delete-post-btn" data-post-id="${post.id}" title="Delete post">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                <div class="post-content">${post.content}</div>
                ${post.image ? `<img src="${post.image}" alt="Post image" class="post-image" />` : ''}
                <div class="post-actions-bar">
                    <span><i class="far fa-heart"></i> ${post.likes.length}</span>
                    <span><i class="far fa-comment"></i> ${post.comments.length}</span>
                </div>
            </div>
        `).join('') : '<p style="color:#6b7080;padding:1rem;">No posts yet. Create your first post!</p>';

        // Attach delete event listeners for profile posts
        document.querySelectorAll('#profilePosts .delete-post-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const postId = this.dataset.postId;
                deletePost(postId);
            });
        });
    }

    function renderFriends() {
        // Friend requests
        const pendingRequests = friendRequests.filter(r => r.to === currentUser.id && r.status === 'pending');
        friendRequestsContainer.innerHTML = pendingRequests.length > 0 ? pendingRequests.map(req => {
            const user = getUser(req.from);
            return `
                <div class="friend-card">
                    <div class="friend-info">
                        <div class="avatar-small">${user.avatar}</div>
                        <div>
                            <div style="font-weight:500;">${user.name}</div>
                            <div style="font-size:0.8rem;color:#6b7080;">Wants to connect</div>
                        </div>
                    </div>
                    <div class="friend-actions">
                        <button class="accept" data-from="${req.from}">Accept</button>
                        <button class="reject" data-from="${req.from}">Reject</button>
                    </div>
                </div>
            `;
        }).join('') : '<p style="color:#6b7080;padding:0.5rem 0;">No pending requests</p>';

        // Friends list
        const friendList = currentUser.friends.map(friendId => getUser(friendId));
        friendsListContainer.innerHTML = friendList.length > 0 ? friendList.map(friend => `
            <div class="friend-card">
                <div class="friend-info">
                    <div class="avatar-small">${friend.avatar}</div>
                    <div>
                        <div style="font-weight:500;">${friend.name}</div>
                        <div style="font-size:0.8rem;color:#6b7080;">${friend.online ? '🟢 Online' : '⚪ Offline'}</div>
                    </div>
                </div>
            </div>
        `).join('') : '<p style="color:#6b7080;padding:0.5rem 0;">No friends yet</p>';

        // Attach friend request handlers
        document.querySelectorAll('.friend-actions .accept').forEach(btn => {
            btn.addEventListener('click', () => handleFriendRequest(btn.dataset.from, 'accept'));
        });
        document.querySelectorAll('.friend-actions .reject').forEach(btn => {
            btn.addEventListener('click', () => handleFriendRequest(btn.dataset.from, 'reject'));
        });
    }

    function renderNotifications() {
        const userNotifications = notifications.filter(n => n.userId === currentUser.id);
        const unreadCount = userNotifications.filter(n => !n.read).length;
        notificationBadge.textContent = unreadCount;
        notificationBadge.style.display = unreadCount > 0 ? 'inline' : 'none';

        notificationsContainer.innerHTML = userNotifications.length > 0 ? userNotifications.map(n => `
            <div class="notification-item" style="${n.read ? 'opacity:0.7;' : 'border-left-color:#4ade80;'}">
                <span>${n.message}</span>
                <span class="time">${formatTime(n.timestamp)}</span>
            </div>
        `).join('') : '<p style="color:#6b7080;padding:1rem 0;">No notifications</p>';

        // Mark as read
        notifications.forEach(n => { if (n.userId === currentUser.id) n.read = true; });
        notificationBadge.textContent = '0';
        notificationBadge.style.display = 'none';
    }

    function renderOnlineUsers() {
        const onlineFriends = currentUser.friends
            .map(id => getUser(id))
            .filter(u => u.online);

        onlineUsersContainer.innerHTML = onlineFriends.length > 0 ? onlineFriends.map(user => `
            <div class="online-user">
                <span>${user.avatar}</span>
                <span>${user.name}</span>
                <span class="status-dot"></span>
            </div>
        `).join('') : '<p style="color:#6b7080;font-size:0.9rem;">No friends online</p>';
    }

    function renderAll() {
        renderPosts();
        renderProfile();
        renderFriends();
        renderNotifications();
        renderOnlineUsers();
        currentUserName.textContent = currentUser.name;
        currentUserStatus.textContent = currentUser.online ? 'Online' : 'Offline';
    }

    // ============================================
    // EVENT HANDLERS
    // ============================================
    function handleLike(e) {
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        const post = posts.find(p => p.id === postId);
        if (!post) return;

        const likeIndex = post.likes.indexOf(currentUser.id);
        if (likeIndex > -1) {
            post.likes.splice(likeIndex, 1);
        } else {
            post.likes.push(currentUser.id);
            // Add notification
            const postUser = getUser(post.userId);
            if (post.userId !== currentUser.id) {
                notifications.push({
                    id: 'n' + notificationIdCounter++,
                    userId: post.userId,
                    message: `${currentUser.name} liked your post: "${post.content.substring(0, 30)}${post.content.length > 30 ? '...' : ''}"`,
                    timestamp: Date.now(),
                    read: false
                });
            }
        }
        renderPosts();
        renderNotifications();
    }

    function handleCommentSubmit(e) {
        const btn = e.currentTarget;
        const postId = btn.dataset.postId;
        const input = document.querySelector(`.comment-input[data-post-id="${postId}"]`);
        const text = input.value.trim();
        if (!text) return;

        const post = posts.find(p => p.id === postId);
        if (!post) return;

        post.comments.push({
            userId: currentUser.id,
            text: text,
            timestamp: Date.now()
        });

        // Add notification
        if (post.userId !== currentUser.id) {
            notifications.push({
                id: 'n' + notificationIdCounter++,
                userId: post.userId,
                message: `${currentUser.name} commented on your post: "${text.substring(0, 30)}${text.length > 30 ? '...' : ''}"`,
                timestamp: Date.now(),
                read: false
            });
        }

        input.value = '';
        renderPosts();
        renderNotifications();
    }

    function handleFriendRequest(fromUserId, action) {
        const request = friendRequests.find(r => r.from === fromUserId && r.to === currentUser.id);
        if (!request) return;

        if (action === 'accept') {
            request.status = 'accepted';
            if (!currentUser.friends.includes(fromUserId)) {
                currentUser.friends.push(fromUserId);
            }
            // Add notification
            notifications.push({
                id: 'n' + notificationIdCounter++,
                userId: fromUserId,
                message: `${currentUser.name} accepted your friend request`,
                timestamp: Date.now(),
                read: false
            });
        } else {
            request.status = 'rejected';
        }
        renderFriends();
        renderNotifications();
        renderProfile();
        renderOnlineUsers();
    }

    function handleNewPost() {
        const content = postInput.value.trim();
        if (!content) {
            showToast('Please write something before posting!');
            return;
        }

        const newPost = {
            id: 'p' + postIdCounter++,
            userId: currentUser.id,
            content: content,
            image: null,
            timestamp: Date.now(),
            likes: [],
            comments: []
        };
        posts.push(newPost);
        postInput.value = '';
        renderPosts();
        renderProfile();
        showToast('Post created successfully!');
    }

    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        // Check file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showToast('Image too large! Please upload under 5MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = function(event) {
            const imageDataUrl = event.target.result;
            // Create a post with image
            const content = postInput.value.trim() || '📸 Shared a photo';
            const newPost = {
                id: 'p' + postIdCounter++,
                userId: currentUser.id,
                content: content,
                image: imageDataUrl,
                timestamp: Date.now(),
                likes: [],
                comments: []
            };
            posts.push(newPost);
            postInput.value = '';
            imageUpload.value = '';
            renderPosts();
            renderProfile();
            showToast('Photo post created successfully!');
        };
        reader.readAsDataURL(file);
    }

    // ============================================
    // NAVIGATION
    // ============================================
    function navigateTo(view) {
        Object.keys(views).forEach(key => {
            views[key].classList.toggle('active', key === view);
        });
        navBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });
    }

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navigateTo(btn.dataset.view);
        });
    });

    // ============================================
    // PROFILE EDIT
    // ============================================
    editProfileBtn.addEventListener('click', () => {
        editName.value = currentUser.name;
        editBio.value = currentUser.bio;
        editProfileModal.classList.add('active');
    });

    closeModalBtn.addEventListener('click', () => {
        editProfileModal.classList.remove('active');
    });

    saveProfileBtn.addEventListener('click', () => {
        const name = editName.value.trim() || currentUser.name;
        const bio = editBio.value.trim() || currentUser.bio;
        currentUser.name = name;
        currentUser.bio = bio;
        users[currentUser.id].name = name;
        users[currentUser.id].bio = bio;
        editProfileModal.classList.remove('active');
        renderAll();
        showToast('Profile updated successfully!');
    });

    // Close modal on click outside
    editProfileModal.addEventListener('click', (e) => {
        if (e.target === editProfileModal) {
            editProfileModal.classList.remove('active');
        }
    });

    // ============================================
    // EVENT LISTENERS
    // ============================================
    submitPostBtn.addEventListener('click', handleNewPost);
    postInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleNewPost();
    });

    imageUploadBtn.addEventListener('click', () => {
        imageUpload.click();
    });
    imageUpload.addEventListener('change', handleImageUpload);

    newPostBtn.addEventListener('click', () => {
        createPostArea.scrollIntoView({ behavior: 'smooth' });
        postInput.focus();
    });

    // ============================================
    // REAL-TIME SIMULATION (WebSocket simulation)
    // ============================================
    function simulateRealtime() {
        // Randomly change online status of some users
        const userIds = Object.keys(users);
        const randomUser = userIds[Math.floor(Math.random() * userIds.length)];
        if (randomUser !== currentUser.id) {
            users[randomUser].online = !users[randomUser].online;
            renderOnlineUsers();
            renderFriends();
        }

        // Randomly add a new post from a friend (30% chance)
        if (Math.random() < 0.3 && currentUser.friends.length > 0) {
            const friendId = currentUser.friends[Math.floor(Math.random() * currentUser.friends.length)];
            const friend = getUser(friendId);
            const samplePosts = [
                'Just had a great coffee break! ☕',
                'Working on something exciting! 🚀',
                'Beautiful day outside! 🌞',
                'Listening to some great music 🎵',
                'Learning new things every day 📚'
            ];
            const randomContent = samplePosts[Math.floor(Math.random() * samplePosts.length)];
            const newPost = {
                id: 'p' + postIdCounter++,
                userId: friendId,
                content: randomContent,
                image: null,
                timestamp: Date.now(),
                likes: [],
                comments: []
            };
            posts.push(newPost);
            renderPosts();
            renderProfile();
        }
    }

    // Start real-time simulation (every 15 seconds)
    setInterval(simulateRealtime, 15000);

    // ============================================
    // INIT
    // ============================================
    renderAll();
    navigateTo('feed');

    console.log('🌐 Social Network Platform initialized!');
    console.log('Current user:', currentUser);
    console.log('Total posts:', posts.length);
    console.log('Total users:', Object.keys(users).length);
    console.log('🗑️ Delete feature: Click the trash icon on your posts to delete them!');
})();