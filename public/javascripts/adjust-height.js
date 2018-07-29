window.onload = function() {
    document.addEventListener('keypress', (event) => {
        const keyName = event.key;
        const player = document.querySelector('#player');
        playerHeight = player.getAttribute('position').y;
        if (keyName === 'z') {
            player.setAttribute('position', {y: playerHeight + 0.1});
        } else if (keyName === 'x') {
            player.setAttribute('position', {y: playerHeight - 0.1});
        }
    });
};