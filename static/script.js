document.addEventListener('DOMContentLoaded', () => {
    const postsContainer = document.getElementById('posts-container');
    if (postsContainer) {
        // Fetch posts from the server
        fetch('/confessions')
            .then(response => response.json())
            .then(data => {
                data.forEach(post => {
                    const postElement = createPostElement(post);
                    postsContainer.appendChild(postElement);
                });
            });

        // Function to create a post element
        const createPostElement = (post) => {
            const postDiv = document.createElement('div');
            postDiv.classList.add('post', 'p-4', 'bg-[#333]', 'rounded-lg', 'space-y-2');

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
                postTimestamp.textContent = `Posted ${moment.utc(post.timestamp).fromNow()}`;
            } else {
                postTimestamp.textContent = 'Posted a long time ago';
            }

            postDiv.appendChild(postHeader);
            postDiv.appendChild(postText);
            postDiv.appendChild(postTimestamp);
            return postDiv;
        };
    }

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
});

function logout() {
    window.location.href = '/logout';
}

function viewLikes() {
    // Show feedback modal
    document.getElementById('feedback-modal').classList.remove('hidden');
}

function navigateHome() {
    window.location.href = '/';
}

function navigateToCreatePost() {
    window.location.href = '/create_post';
}

function navigateToProfile() {
    window.location.href = '/profile';
}
document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = document.getElementById('theme-icon');

    // Check saved theme preference in localStorage
    const currentTheme = localStorage.getItem('theme') || 'dark';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeIcon.className = currentTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';

    // Toggle Theme
    themeToggle.addEventListener('click', () => {
        const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Update the icon
        themeIcon.className = newTheme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
    });
});
