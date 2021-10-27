package main

type Airports struct {
	AirportId  string  `json:"airportId"`
	Location   string  `json:"location"`
}

type Airlines struct {
	AirlineId   string  `json:"airlineId"`
}
type Interline struct {
	InterlineId   string `json:"interlineId"`
	InterlineName string `json:"interlineName"`
	Address       string `json:"address"`
}

type BaggageRoute struct {
	BaggageId   string    `json:"baggageId"`
	UserId      string    `json:"userId"`
	Source      string    `json:"source"`
	Destination string    `json:"destination"`
	TotalExpence float64    `json:"totalExpence"`
	AirportFees []float64 `json:"airportFees"`
	AirlineFees []float64 `json:"airlineFees"`
	Path        []Route   `json:"path"`
}

type Route struct {
	AirportId string  `json:"airportId"`
	AirportStatus     bool  `json:"airportStatus"`
	AirlineId string `json:"airlineId"`
	AirlineStatus     bool  `json:"airlineStatus"`

}

type MSPList struct {
	OrgType string `json:"orgType"`
	MSP     string `json:"MSP"`
	ID      string `json:"ID"`
}