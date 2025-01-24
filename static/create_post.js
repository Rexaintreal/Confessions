document.addEventListener('DOMContentLoaded', () => {
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

function createConfession() {
    const confessionText = prompt('Enter your confession:');
    if (confessionText) {
        fetch('/confess', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ confession: confessionText })
        })
        .then(response => response.json())
        .then(data => {
            if (data.status === 'success') {
                location.reload();
            } else {
                alert('You need to log in to create a confession.');
            }
        });
    }
}


function submitConfession() {
    const confessionText = document.getElementById('confession-text').value;
    const charCount = confessionText.length;

    if (charCount === 0) {
        alert('Confession cannot be empty.');
        return;
    }

    fetch('/confess', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confession: confessionText }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === 'success') {
                navigateHome();
            } else {
                alert('You need to log in to create a confession.');
            }
        });
}

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

document.getElementById('confession-text').addEventListener('input', function () {
    const charCount = this.value.length;
    const maxChars = this.getAttribute('maxlength');
    const charCountElement = document.getElementById('char-count');
    
    // Update the character count display including the "characters" text
    charCountElement.textContent = `${charCount}/${maxChars} characters`;
});


function updatePreview() {
    const confessionText = document.getElementById('confession-text').value;
    const previewBox = document.getElementById('preview');
    const charCount = document.getElementById('char-count');
    
    previewBox.innerHTML = ''; // Clear previous content

    // Update character counter
    charCount.textContent = confessionText.length;

    if (confessionText.trim()) {
        // Create post preview elements
        const postDiv = document.createElement('div');
        postDiv.classList.add('post');

        const postHeader = document.createElement('div');
        postHeader.classList.add('post-header');

        const userIcon = document.createElement('i');
        userIcon.classList.add('fas', 'fa-user', 'user-icon');

        const usernameSpan = document.createElement('span');
        usernameSpan.classList.add('username');
        usernameSpan.textContent = 'Anonymous'; // Default username

        postHeader.appendChild(userIcon);
        postHeader.appendChild(usernameSpan);

        const postText = document.createElement('div');
        postText.classList.add('post-text');
        postText.textContent = confessionText;

        const postTimestamp = document.createElement('div');
        postTimestamp.classList.add('post-timestamp');
        postTimestamp.textContent = 'Preview Mode'; // Fixed text for preview

        postDiv.appendChild(postHeader);
        postDiv.appendChild(postText);
        postDiv.appendChild(postTimestamp);

        // Append to preview box
        previewBox.appendChild(postDiv);
        previewBox.classList.remove('hidden');
    } else {
        previewBox.classList.add('hidden');
    }
}
