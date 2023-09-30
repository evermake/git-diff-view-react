from bs4 import BeautifulSoup
import json 

if __name__ == "__main__":
    soup = BeautifulSoup
    html_cont = None
    # Specify html doc by yourself 
    with open("my_file_diff.html", 'r', encoding="utf-8") as file:
        html_cont = file.read()
    soup = BeautifulSoup(html_cont, 'html.parser')
    divs = soup.select('div#files>div.js-diff-progressive-container>div')
    total_lines = 0
    anchor_line = 0
    my_obj = dict()
    my_obj['totalLines'] = total_lines
    my_obj['files'] = []
    my_obj['lines'] = []
    for div in divs:
        lines = []
        file = dict()
        file['fileName'] = div.select('a.Link--primary')[0].text
        file['isBinary'] = False
        diffs = div.select('tr[data-hunk]')
        file['diffStart'] = anchor_line + 1
        file['diffEnd'] = anchor_line + len(diffs)
        anchor_line += len(diffs)
        total_lines += len(diffs)
        for diff in diffs:
            changes = dict()
            first_line = diff.select('td:nth-child(2)>span[data-code-marker]')
            second_line = diff.select('td:nth-child(4)>span[data-code-marker]')
            first_val = " "
            second_val = " "
            if len(first_line) != 0:
                first_val = first_line[0].get('data-code-marker')
            if len(second_line) != 0:
                second_val = second_line[0].get('data-code-marker')
            if second_val == first_val == " ":
                changes['type'] = "not-modified"
                changes['content'] = diff.select('td:nth-child(4)>span')[0].text
            elif (first_val == "-" and second_val == "+"):
                changes['type'] = "modified"
                changes['oldContent'] = diff.select('td:nth-child(2)>span')[0].text
                changes['newContent'] = diff.select('td:nth-child(4)>span')[0].text
            elif (first_val == " " and second_val == "+"):
                changes["type"] = "added"
                changes['content'] = diff.select('td:nth-child(4)>span')[0].text
            elif (first_val == "-" and second_val == " "):
                changes["type"] = "deleted"
                changes['content'] = diff.select('td:nth-child(2)>span')[0].text
            lines.append(changes)
        my_obj['lines'].extend(lines)
        my_obj['files'].extend([file])
    my_obj['totalLines'] = total_lines
    # specify out document by yourself
    with open("mockdata.json", "w") as outfile:
        json.dump(my_obj, outfile)