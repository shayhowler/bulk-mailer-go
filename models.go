package main

// Account represents an email account configuration
type Account struct {
	Name       string `json:"name"`
	Email      string `json:"email"`
	Password   string `json:"password"`
	SMTPServer string `json:"smtp_server"`
	SMTPPort   int    `json:"smtp_port"`
	UseTLS     bool   `json:"use_tls"`
}

// Template represents an email template
type Template struct {
	Name       string `json:"name"`
	Subject    string `json:"subject"`
	Body       string `json:"body"`
	Content    string `json:"content,omitempty"`  // For backward compatibility
	HTML       string `json:"html,omitempty"`      // For backward compatibility
	IsPlain    bool   `json:"isPlain"`
	Language   string `json:"language,omitempty"`  // Language of the template
	CreatedAt  string `json:"createdAt"`
	ModifiedAt string `json:"modifiedAt"`
}

// Contact represents a contact in the mailing list
type Contact struct {
	Email  string                 `json:"email"`
	Fields map[string]string      `json:"fields"`
	Data   map[string]interface{} `json:"data,omitempty"` // Backward compatibility
	Valid  bool                   `json:"valid"`
	Sent   bool                   `json:"sent"`
	Error  string                 `json:"error,omitempty"`
}

// Settings represents application settings
type Settings struct {
	Country         string `json:"country"`
	Timezone        string `json:"timezone"`
	DateFormat      string `json:"dateFormat"`
	DefaultLanguage string `json:"defaultLanguage"`
}

// EmailRequest represents an email sending request
type EmailRequest struct {
	From        string   `json:"from"`
	To          []string `json:"to"`
	Subject     string   `json:"subject"`
	Body        string   `json:"body"`
	IsHTML      bool     `json:"isHTML"`
	Attachments []string `json:"attachments"`
	AccountName string   `json:"accountName"`
}

// SendProgress represents email sending progress
type SendProgress struct {
	Total     int    `json:"total"`
	Sent      int    `json:"sent"`
	Failed    int    `json:"failed"`
	Remaining int    `json:"remaining"`
	Status    string `json:"status"`
}

// ImportResult represents the result of an import operation
type ImportResult struct {
	Success  bool     `json:"success"`
	Total    int      `json:"total"`
	Valid    int      `json:"valid"`
	Invalid  int      `json:"invalid"`
	Fields   []string `json:"fields"`
	Message  string   `json:"message"`
	Contacts []Contact `json:"contacts,omitempty"`
}
