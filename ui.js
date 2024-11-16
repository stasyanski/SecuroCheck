function close_disclaimer() {
    document.querySelector('.disclaimer_container').style.display = 'none';
}

document.querySelector('#close_btn').addEventListener('click', close_disclaimer);
