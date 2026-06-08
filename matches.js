const matches = [
  // Group A
  { id:"A1", group:"A", date:"2026-06-11", time:"15:00", kickoffEdt:"2026-06-11T15:00:00-04:00", team1:"Mexico", team2:"South Africa" },
  { id:"A2", group:"A", date:"2026-06-11", time:"22:00", kickoffEdt:"2026-06-11T22:00:00-04:00", team1:"Korea Republic", team2:"Czechia" },
  { id:"A3", group:"A", date:"2026-06-18", time:"12:00", kickoffEdt:"2026-06-18T12:00:00-04:00", team1:"Czechia", team2:"South Africa" },
  { id:"A4", group:"A", date:"2026-06-18", time:"21:00", kickoffEdt:"2026-06-18T21:00:00-04:00", team1:"Mexico", team2:"Korea Republic" },
  { id:"A5", group:"A", date:"2026-06-24", time:"21:00", kickoffEdt:"2026-06-24T21:00:00-04:00", team1:"South Africa", team2:"Korea Republic" },
  { id:"A6", group:"A", date:"2026-06-24", time:"21:00", kickoffEdt:"2026-06-24T21:00:00-04:00", team1:"Czechia", team2:"Mexico" },

  // Group B
  { id:"B1", group:"B", date:"2026-06-12", time:"15:00", kickoffEdt:"2026-06-12T15:00:00-04:00", team1:"Canada", team2:"Bosnia and Herzegovina" },
  { id:"B2", group:"B", date:"2026-06-13", time:"15:00", kickoffEdt:"2026-06-13T15:00:00-04:00", team1:"Qatar", team2:"Switzerland" },
  { id:"B3", group:"B", date:"2026-06-18", time:"15:00", kickoffEdt:"2026-06-18T15:00:00-04:00", team1:"Switzerland", team2:"Bosnia and Herzegovina" },
  { id:"B4", group:"B", date:"2026-06-18", time:"18:00", kickoffEdt:"2026-06-18T18:00:00-04:00", team1:"Canada", team2:"Qatar" },
  { id:"B5", group:"B", date:"2026-06-24", time:"15:00", kickoffEdt:"2026-06-24T15:00:00-04:00", team1:"Bosnia and Herzegovina", team2:"Qatar" },
  { id:"B6", group:"B", date:"2026-06-24", time:"15:00", kickoffEdt:"2026-06-24T15:00:00-04:00", team1:"Switzerland", team2:"Canada" },

  // Group C
  { id:"C1", group:"C", date:"2026-06-13", time:"18:00", kickoffEdt:"2026-06-13T18:00:00-04:00", team1:"Brazil", team2:"Morocco" },
  { id:"C2", group:"C", date:"2026-06-13", time:"21:00", kickoffEdt:"2026-06-13T21:00:00-04:00", team1:"Haiti", team2:"Scotland" },
  { id:"C3", group:"C", date:"2026-06-19", time:"18:00", kickoffEdt:"2026-06-19T18:00:00-04:00", team1:"Scotland", team2:"Morocco" },
  { id:"C4", group:"C", date:"2026-06-19", time:"20:30", kickoffEdt:"2026-06-19T20:30:00-04:00", team1:"Brazil", team2:"Haiti" },
  { id:"C5", group:"C", date:"2026-06-24", time:"18:00", kickoffEdt:"2026-06-24T18:00:00-04:00", team1:"Morocco", team2:"Haiti" },
  { id:"C6", group:"C", date:"2026-06-24", time:"18:00", kickoffEdt:"2026-06-24T18:00:00-04:00", team1:"Scotland", team2:"Brazil" },

  // Group D
  { id:"D1", group:"D", date:"2026-06-12", time:"21:00", kickoffEdt:"2026-06-12T21:00:00-04:00", team1:"USA", team2:"Paraguay" },
  { id:"D2", group:"D", date:"2026-06-14", time:"00:00", kickoffEdt:"2026-06-14T00:00:00-04:00", team1:"Australia", team2:"Türkiye" },
  { id:"D3", group:"D", date:"2026-06-19", time:"15:00", kickoffEdt:"2026-06-19T15:00:00-04:00", team1:"USA", team2:"Australia" },
  { id:"D4", group:"D", date:"2026-06-19", time:"23:00", kickoffEdt:"2026-06-19T23:00:00-04:00", team1:"Türkiye", team2:"Paraguay" },
  { id:"D5", group:"D", date:"2026-06-25", time:"22:00", kickoffEdt:"2026-06-25T22:00:00-04:00", team1:"Paraguay", team2:"Australia" },
  { id:"D6", group:"D", date:"2026-06-25", time:"22:00", kickoffEdt:"2026-06-25T22:00:00-04:00", team1:"Türkiye", team2:"USA" },

  // Group E
  { id:"E1", group:"E", date:"2026-06-14", time:"13:00", kickoffEdt:"2026-06-14T13:00:00-04:00", team1:"Germany", team2:"Curaçao" },
  { id:"E2", group:"E", date:"2026-06-14", time:"19:00", kickoffEdt:"2026-06-14T19:00:00-04:00", team1:"Côte d'Ivoire", team2:"Ecuador" },
  { id:"E3", group:"E", date:"2026-06-20", time:"16:00", kickoffEdt:"2026-06-20T16:00:00-04:00", team1:"Germany", team2:"Côte d'Ivoire" },
  { id:"E4", group:"E", date:"2026-06-20", time:"20:00", kickoffEdt:"2026-06-20T20:00:00-04:00", team1:"Ecuador", team2:"Curaçao" },
  { id:"E5", group:"E", date:"2026-06-25", time:"16:00", kickoffEdt:"2026-06-25T16:00:00-04:00", team1:"Curaçao", team2:"Côte d'Ivoire" },
  { id:"E6", group:"E", date:"2026-06-25", time:"16:00", kickoffEdt:"2026-06-25T16:00:00-04:00", team1:"Ecuador", team2:"Germany" },

  // Group F
  { id:"F1", group:"F", date:"2026-06-14", time:"16:00", kickoffEdt:"2026-06-14T16:00:00-04:00", team1:"Netherlands", team2:"Japan" },
  { id:"F2", group:"F", date:"2026-06-14", time:"22:00", kickoffEdt:"2026-06-14T22:00:00-04:00", team1:"Sweden", team2:"Tunisia" },
  { id:"F3", group:"F", date:"2026-06-20", time:"13:00", kickoffEdt:"2026-06-20T13:00:00-04:00", team1:"Netherlands", team2:"Sweden" },
  { id:"F4", group:"F", date:"2026-06-21", time:"00:00", kickoffEdt:"2026-06-21T00:00:00-04:00", team1:"Tunisia", team2:"Japan" },
  { id:"F5", group:"F", date:"2026-06-25", time:"19:00", kickoffEdt:"2026-06-25T19:00:00-04:00", team1:"Tunisia", team2:"Netherlands" },
  { id:"F6", group:"F", date:"2026-06-25", time:"19:00", kickoffEdt:"2026-06-25T19:00:00-04:00", team1:"Japan", team2:"Sweden" },

  // Group G
  { id:"G1", group:"G", date:"2026-06-15", time:"15:00", kickoffEdt:"2026-06-15T15:00:00-04:00", team1:"Belgium", team2:"Egypt" },
  { id:"G2", group:"G", date:"2026-06-15", time:"21:00", kickoffEdt:"2026-06-15T21:00:00-04:00", team1:"IR Iran", team2:"New Zealand" },
  { id:"G3", group:"G", date:"2026-06-21", time:"15:00", kickoffEdt:"2026-06-21T15:00:00-04:00", team1:"Belgium", team2:"IR Iran" },
  { id:"G4", group:"G", date:"2026-06-21", time:"21:00", kickoffEdt:"2026-06-21T21:00:00-04:00", team1:"New Zealand", team2:"Egypt" },
  { id:"G5", group:"G", date:"2026-06-26", time:"23:00", kickoffEdt:"2026-06-26T23:00:00-04:00", team1:"New Zealand", team2:"Belgium" },
  { id:"G6", group:"G", date:"2026-06-26", time:"23:00", kickoffEdt:"2026-06-26T23:00:00-04:00", team1:"Egypt", team2:"IR Iran" },

  // Group H
  { id:"H1", group:"H", date:"2026-06-15", time:"12:00", kickoffEdt:"2026-06-15T12:00:00-04:00", team1:"Spain", team2:"Cabo Verde" },
  { id:"H2", group:"H", date:"2026-06-15", time:"18:00", kickoffEdt:"2026-06-15T18:00:00-04:00", team1:"Saudi Arabia", team2:"Uruguay" },
  { id:"H3", group:"H", date:"2026-06-21", time:"12:00", kickoffEdt:"2026-06-21T12:00:00-04:00", team1:"Spain", team2:"Saudi Arabia" },
  { id:"H4", group:"H", date:"2026-06-21", time:"18:00", kickoffEdt:"2026-06-21T18:00:00-04:00", team1:"Uruguay", team2:"Cabo Verde" },
  { id:"H5", group:"H", date:"2026-06-26", time:"20:00", kickoffEdt:"2026-06-26T20:00:00-04:00", team1:"Uruguay", team2:"Spain" },
  { id:"H6", group:"H", date:"2026-06-26", time:"20:00", kickoffEdt:"2026-06-26T20:00:00-04:00", team1:"Cabo Verde", team2:"Saudi Arabia" },

  // Group I
  { id:"I1", group:"I", date:"2026-06-16", time:"15:00", kickoffEdt:"2026-06-16T15:00:00-04:00", team1:"France", team2:"Senegal" },
  { id:"I2", group:"I", date:"2026-06-16", time:"18:00", kickoffEdt:"2026-06-16T18:00:00-04:00", team1:"Iraq", team2:"Norway" },
  { id:"I3", group:"I", date:"2026-06-22", time:"17:00", kickoffEdt:"2026-06-22T17:00:00-04:00", team1:"France", team2:"Iraq" },
  { id:"I4", group:"I", date:"2026-06-22", time:"20:00", kickoffEdt:"2026-06-22T20:00:00-04:00", team1:"Norway", team2:"Senegal" },
  { id:"I5", group:"I", date:"2026-06-26", time:"15:00", kickoffEdt:"2026-06-26T15:00:00-04:00", team1:"Senegal", team2:"Iraq" },
  { id:"I6", group:"I", date:"2026-06-26", time:"15:00", kickoffEdt:"2026-06-26T15:00:00-04:00", team1:"Norway", team2:"France" },

  // Group J
  { id:"J1", group:"J", date:"2026-06-16", time:"21:00", kickoffEdt:"2026-06-16T21:00:00-04:00", team1:"Argentina", team2:"Algeria" },
  { id:"J2", group:"J", date:"2026-06-17", time:"00:00", kickoffEdt:"2026-06-17T00:00:00-04:00", team1:"Austria", team2:"Jordan" },
  { id:"J3", group:"J", date:"2026-06-22", time:"13:00", kickoffEdt:"2026-06-22T13:00:00-04:00", team1:"Argentina", team2:"Austria" },
  { id:"J4", group:"J", date:"2026-06-22", time:"23:00", kickoffEdt:"2026-06-22T23:00:00-04:00", team1:"Jordan", team2:"Algeria" },
  { id:"J5", group:"J", date:"2026-06-27", time:"22:00", kickoffEdt:"2026-06-27T22:00:00-04:00", team1:"Algeria", team2:"Austria" },
  { id:"J6", group:"J", date:"2026-06-27", time:"22:00", kickoffEdt:"2026-06-27T22:00:00-04:00", team1:"Jordan", team2:"Argentina" },

  // Group K
  { id:"K1", group:"K", date:"2026-06-17", time:"13:00", kickoffEdt:"2026-06-17T13:00:00-04:00", team1:"Portugal", team2:"Congo DR" },
  { id:"K2", group:"K", date:"2026-06-17", time:"22:00", kickoffEdt:"2026-06-17T22:00:00-04:00", team1:"Uzbekistan", team2:"Colombia" },
  { id:"K3", group:"K", date:"2026-06-23", time:"13:00", kickoffEdt:"2026-06-23T13:00:00-04:00", team1:"Portugal", team2:"Uzbekistan" },
  { id:"K4", group:"K", date:"2026-06-23", time:"22:00", kickoffEdt:"2026-06-23T22:00:00-04:00", team1:"Colombia", team2:"Congo DR" },
  { id:"K5", group:"K", date:"2026-06-27", time:"19:30", kickoffEdt:"2026-06-27T19:30:00-04:00", team1:"Congo DR", team2:"Uzbekistan" },
  { id:"K6", group:"K", date:"2026-06-27", time:"19:30", kickoffEdt:"2026-06-27T19:30:00-04:00", team1:"Colombia", team2:"Portugal" },

  // Group L
  { id:"L1", group:"L", date:"2026-06-17", time:"16:00", kickoffEdt:"2026-06-17T16:00:00-04:00", team1:"England", team2:"Croatia" },
  { id:"L2", group:"L", date:"2026-06-17", time:"19:00", kickoffEdt:"2026-06-17T19:00:00-04:00", team1:"Ghana", team2:"Panama" },
  { id:"L3", group:"L", date:"2026-06-23", time:"16:00", kickoffEdt:"2026-06-23T16:00:00-04:00", team1:"England", team2:"Ghana" },
  { id:"L4", group:"L", date:"2026-06-23", time:"19:00", kickoffEdt:"2026-06-23T19:00:00-04:00", team1:"Panama", team2:"Croatia" },
  { id:"L5", group:"L", date:"2026-06-27", time:"17:00", kickoffEdt:"2026-06-27T17:00:00-04:00", team1:"Panama", team2:"England" },
  { id:"L6", group:"L", date:"2026-06-27", time:"17:00", kickoffEdt:"2026-06-27T17:00:00-04:00", team1:"Croatia", team2:"Ghana" }
];
``
