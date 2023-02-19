export function execute(string) {
    let newContent = string.split('');
    newContent.forEach((val, index) => {
        if (val == '<') newContent[index] = '&lt';
        if (val == '>') newContent[index] = '&gt';
    });
    return newContent.join('');
}