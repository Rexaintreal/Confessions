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
// Add a live character counter for the textarea
document.getElementById('confession-text').addEventListener('input', function () {
    const charCount = this.value.length;
    const maxChars = this.getAttribute('maxlength');
    document.getElementById('char-count').textContent = charCount;
});