export namespace main {
	
	export class Account {
	    name: string;
	    email: string;
	    password: string;
	    smtp_server: string;
	    smtp_port: number;
	    use_tls: boolean;
	
	    static createFrom(source: any = {}) {
	        return new Account(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.email = source["email"];
	        this.password = source["password"];
	        this.smtp_server = source["smtp_server"];
	        this.smtp_port = source["smtp_port"];
	        this.use_tls = source["use_tls"];
	    }
	}
	export class AttachmentInfo {
	    path: string;
	    name: string;
	    size: number;
	    type: string;
	    lastModified: number;
	
	    static createFrom(source: any = {}) {
	        return new AttachmentInfo(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.path = source["path"];
	        this.name = source["name"];
	        this.size = source["size"];
	        this.type = source["type"];
	        this.lastModified = source["lastModified"];
	    }
	}
	export class Contact {
	    email: string;
	    fields: Record<string, string>;
	    data?: Record<string, any>;
	    valid: boolean;
	    sent: boolean;
	    error?: string;
	
	    static createFrom(source: any = {}) {
	        return new Contact(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.email = source["email"];
	        this.fields = source["fields"];
	        this.data = source["data"];
	        this.valid = source["valid"];
	        this.sent = source["sent"];
	        this.error = source["error"];
	    }
	}
	export class Settings {
	    country: string;
	    timezone: string;
	    dateFormat: string;
	    defaultLanguage: string;
	
	    static createFrom(source: any = {}) {
	        return new Settings(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.country = source["country"];
	        this.timezone = source["timezone"];
	        this.dateFormat = source["dateFormat"];
	        this.defaultLanguage = source["defaultLanguage"];
	    }
	}
	export class Template {
	    name: string;
	    subject: string;
	    body: string;
	    content?: string;
	    html?: string;
	    isPlain: boolean;
	    language?: string;
	    createdAt: string;
	    modifiedAt: string;
	
	    static createFrom(source: any = {}) {
	        return new Template(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.subject = source["subject"];
	        this.body = source["body"];
	        this.content = source["content"];
	        this.html = source["html"];
	        this.isPlain = source["isPlain"];
	        this.language = source["language"];
	        this.createdAt = source["createdAt"];
	        this.modifiedAt = source["modifiedAt"];
	    }
	}

}

