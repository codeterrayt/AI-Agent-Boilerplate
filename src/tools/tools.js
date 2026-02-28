import fs from "node:fs";
import { execSync } from "node:child_process";

async function executeCommand(cmd = '') {
    console.log('executing command', cmd)
    const result = execSync(cmd)
    console.log('command executed successfully')
    return result.toString();
}

async function createFile(file_name = '', file_content = '') {
    try {
        console.log('creating file', file_name)
        fs.writeFileSync(file_name, file_content)
        console.log('file created successfully')
        return 'file created successfully';
    } catch (error) {
        console.log('file creation failed, error: ' + error)
        return 'file creation failed, error: ' + error;
    }
}

export default {
    executeCommand,
    createFile
}