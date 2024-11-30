// constants
const input = document.querySelector('.pass_checker_container form input');
const pass_container = document.querySelector('.pass_checker_container');
const output_p = document.querySelector('.pass_checker_container p')
const text_to_change = [
    document.querySelector('.pass_checker_container h1'),
    document.querySelector('.pass_checker_container form label'),
    document.querySelector('.pass_checker_container p'),

]


// change the colours of the main div based on input
function apply_styles(background_color, text_shadow) {
    // apply background color to pass_container
    pass_container.style.backgroundColor = background_color;

    // apply text_shadow to each element in text_to_change
    for (let text of text_to_change) {
        text.style.textShadow = text_shadow;
    }
}
function handle_input() {
    // check if input is empty
    if (input.value == null || input.value === '') {
        apply_styles('#c39aa6', 'whitesmoke 0px 0px 2px');
        output_p.innerHTML = 'This website does not collect any data about the passwords you enter.'
    } else {
        // assign to local var to avoid issues with accessing window var
        let x = window.time_to_crack;

        // check time_to_crack value and change color accordingly
        if (x.includes('seconds') || x.includes('minutes')) {
            apply_styles('#ff474c', 'whitesmoke 0px 0px 2px');  // red
            output_p.innerHTML = `A computer would take ${x} to crack this password.`
        } else if (x.includes('hours')) {
            apply_styles('#fdaa48', 'grey 0px 0px 6px');  // orange
            output_p.innerHTML = `A computer would take ${x} to crack this password.`
        } else if (x.includes('days')) {
            apply_styles('#66d25f', 'grey 0px 0px 6px');  // green
            output_p.innerHTML = `A computer would take ${x} to crack this password.`
        } else if (x.includes('years')) {
            apply_styles('#00c78f', 'whitesmoke 0px 0px 2px');  // vibrant dark green bluish
            output_p.innerHTML = `A computer would take ${x} to crack this password.`
        } else {
            apply_styles('#c471f5', 'whitesmoke 0px 0px 2px');  // default color
            output_p.innerHTML = 'This website does not collect any data about the passwords you enter.'
        }
        // check if weak pattern exists
        if (window.weak_pattern[0] !== false) {
            // set background to dark red if weak pattern exists
            apply_styles('#8B0000', 'whitesmoke 0px 0px 2px');
            // check for specific week pattern
            if (window.weak_pattern[1] !== null && weak_pattern[2] == null) {
                output_p.innerHTML = `Weak password detected! Avoid using ${window.weak_pattern[1]}.`
            } else if (window.weak_pattern[1] == null && weak_pattern[2] !== null) {
                output_p.innerHTML = `Weak pattern detected! Avoid using patterns like AAA, QWERTY, 123.`
            } else if (window.weak_pattern[1] !== null && weak_pattern[2] !== null) {
                output_p.innerHTML = `Are you competing for the world most unsafe password?`
            }
        }
    }
}
// listen to multiple events to handle various ways text could be input or deleted
input.addEventListener('input', handle_input);  // typing, pasting, etc.
input.addEventListener('keydown', handle_input); // detect keypresses (for deletions, backspaces, etc.)
input.addEventListener('keyup', handle_input);   // after key is released, useful for certain cases like undo
input.addEventListener('paste', handle_input);   // handling paste events

// hide the container on press ok btn
function close_disclaimer() {
    document.querySelector('.disclaimer_container').style.display = 'none';
}
document.querySelector('#close_btn').addEventListener('click', close_disclaimer);
