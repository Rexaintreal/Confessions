document.addEventListener('DOMContentLoaded', () => {
    const userPostsContainer = document.getElementById('user-posts-container');

    // Fetch user's posts from the server
    fetch('/user_posts')
        .then(response => response.json())
        .then(data => {
            data.forEach(post => {
                const postElement = createPostElement(post);
                userPostsContainer.appendChild(postElement);
            });
        });
    // Modal close button event
    const closeModalButton = document.getElementById('close-modal-button');
    if (closeModalButton) {
        closeModalButton.addEventListener('click', () => {
            document.getElementById('feedback-modal').classList.add('hidden');
        });
    }

    // Visit Instagram button event
    const visitInstagramButton = document.getElementById('visit-instagram-button');
    if (visitInstagramButton) {
        visitInstagramButton.addEventListener('click', () => {
            window.location.href = 'https://www.instagram.com/saurabhcodesawfully';
        });
    }
     // Function to create a post element
     const createPostElement = (post) => {
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');
        postDiv.id = `post-${post.id}`;

        const postHeader = document.createElement('div');
        postHeader.classList.add('post-header');

        const userIcon = document.createElement('i');
        userIcon.classList.add('fas', 'fa-user', 'user-icon');

        const usernameSpan = document.createElement('span');
        usernameSpan.classList.add('username');
        usernameSpan.textContent = 'Anonymous';

        postHeader.appendChild(userIcon);
        postHeader.appendChild(usernameSpan);

        const postText = document.createElement('div');
        postText.classList.add('post-text');
        postText.textContent = post.text;

        const postTimestamp = document.createElement('div');
        postTimestamp.classList.add('post-timestamp', 'text-sm', 'text-gray-400');
        if (post.timestamp) {
            const utcTime = moment.utc(post.timestamp);
            postTimestamp.textContent = `Posted ${utcTime.fromNow()}`;
        } else {
            postTimestamp.textContent = 'Posted a long time ago';
        }

        const deleteButton = document.createElement('button');
        deleteButton.classList.add('delete-button', 'text-red-500', 'hover:text-red-700');
        deleteButton.innerHTML = '<i class="fas fa-trash-alt"></i>';
        deleteButton.onclick = () => deletePost(post.id);

        postDiv.appendChild(postHeader);
        postDiv.appendChild(postText);
        postDiv.appendChild(postTimestamp);
        postDiv.appendChild(deleteButton);
        return postDiv;
    };

    
    // Function to delete a post
    const deletePost = (postId) => {
        // Send a delete request to the server
        fetch(`/delete_post/${postId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                const postElement = document.getElementById(`post-${postId}`);
                if (postElement) {
                    postElement.remove();
                }
            } else {
                alert('Failed to delete the post.');
            }
        });
    };
});

function navigateHome() {
    window.location.href = '/';
}

function navigateToCreatePost() {
    window.location.href = '/create_post';
}

function navigateToProfile() {
    window.location.href = '/profile';
}
function viewLikes() {
    // Show feedback modal
    document.getElementById('feedback-modal').classList.remove('hidden');
}
    