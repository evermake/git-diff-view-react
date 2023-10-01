import { JavascriptPlain, CPlain, CplusplusPlain, BashPlain, PythonPlain, MarkdownOriginal, JavaPlain, GoPlain, LinuxPlain } from 'devicons-react'

interface P {
    path: string
    size?: number
}

function FileIcon(props: P) {
    const extension = props.path.split('.').pop()

    switch (extension) {
        case "java":
            return <JavaPlain size={props.size} />
        case "js":
            return <JavascriptPlain size={props.size} />
        case "go":
            return <GoPlain size={props.size} />
        case "md":
            return <MarkdownOriginal size={props.size} />
        case "py":
            return <PythonPlain size={props.size} />
        case "c":
        case "h":
            return <CPlain size={props.size} />
        case "cpp":
        case "c++":
            return <CplusplusPlain size={props.size} />
        case "sh":
        case "bash":
        case "zsh":
            return <BashPlain size={props.size} />
        default:
            return <LinuxPlain size={props.size} />
    }
}

export default FileIcon