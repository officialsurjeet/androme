import Node from './node';
import NodeList from './nodelist';
import Resource from './resource';

import { lastIndexOf, trimString } from '../lib/util';

type ExpressResult = {
    zipname: string;
    application: string;
    system: string;
};

export default abstract class File<T extends Node> implements androme.lib.base.File<T> {
    public static downloadToDisk(data: Blob, filename: string, mime = '') {
        const blob = new Blob([data], { type: mime || 'application/octet-stream' });
        if (typeof window.navigator.msSaveBlob !== 'undefined') {
            window.navigator.msSaveBlob(blob, filename);
            return;
        }
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.style.display = 'none';
        element.href = url;
        element.setAttribute('download', filename);
        if (typeof element.download === 'undefined') {
            element.setAttribute('target', '_blank');
        }
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        setTimeout(() => window.URL.revokeObjectURL(url), 1);
    }

    public appName = '';

    public readonly assets: FileAsset[] = [];

    protected constructor(public resource: Resource<T>) {
        resource.fileHandler = this;
    }

    public abstract saveAllToDisk(data: SessionData<NodeList<T>>): void;
    public abstract get userSettings(): UserSettings;

    public addAsset(pathname: string, filename: string, content = '', uri: string = '') {
        if (content !== '' || uri !== '') {
            const index = this.assets.findIndex(item => item.pathname === pathname && item.filename === filename);
            if (index !== -1) {
                this.assets[index].content = content || '';
                this.assets[index].uri = uri || '';
            }
            else {
                this.assets.push({
                    pathname,
                    filename,
                    content,
                    uri
                });
            }
        }
    }

    public reset() {
        this.assets.length = 0;
    }

    public saveToDisk(files: FileAsset[]) {
        const settings = this.userSettings;
        if (!location.protocol.startsWith('http')) {
            alert('SERVER (required): See README for instructions');
            return;
        }
        if (files.length) {
            files.push(...this.assets);
            fetch(`/api/savetodisk` +
                `?directory=${encodeURIComponent(trimString(settings.outputDirectory, '/'))}` +
                `&appname=${encodeURIComponent(this.appName.trim())}` +
                `&filetype=${settings.outputArchiveFileType.toLowerCase()}` +
                `&processingtime=${settings.outputMaxProcessingTime.toString().trim()}`,
                {
                    method: 'POST',
                    body: JSON.stringify(files),
                    headers: new Headers({ 'Accept': 'application/json, text/plain, */*', 'Content-Type': 'application/json' })
                }
            )
            .then((response: Response) => response.json())
            .then((result: ExpressResult) => {
                if (result) {
                    if (result.zipname) {
                        fetch(`/api/downloadtobrowser?filename=${encodeURIComponent(result.zipname)}`)
                            .then((response2: Response) => response2.blob())
                            .then((result2: Blob) => File.downloadToDisk(result2, lastIndexOf(result.zipname)));
                    }
                    else if (result.system) {
                        alert(`${result.application}\n\n${result.system}`);
                    }
                }
            })
            .catch(err => alert(`ERROR: ${err}`));
        }
    }

    get stored() {
        return this.resource.stored;
    }
}