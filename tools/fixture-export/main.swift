import Foundation

// Exports the Trends fixtures for the web demo from the app's own engine, so the website never
// re-implements scoring. Mirrors BesidePresentation's quick demo: the simulated history is rebuilt for
// every selected day (SimulatedSource + DemoScenarioRules). The web page only shows demo data, so there
// are three scenario fixtures and no "my data" set.
// Run: tools/fixture-export/export.sh

let homeTimeZone = "Europe/Helsinki"
let today = Day(Date())
let browseDays = 120

/// Same order and keys as BesideHealthMetric (Features/Everyday/BesideDemoControlsView.swift).
let metrics: [(id: String, key: String, unit: String, group: String)] = [
    ("steps", F.steps, "steps", "Daily signals"), ("sleep", F.sleepHours, "hours", "Daily signals"),
    ("bedtime", F.bedtime, "time", "Daily signals"), ("wake", F.wake, "time", "Daily signals"),
    ("exercise", F.exerciseMin, "minutes", "Daily signals"), ("daylight", F.daylightMin, "minutes", "Daily signals"),
    ("heartRate", F.restingHR, "bpm", "Daily signals"), ("hrv", F.hrv, "ms", "Daily signals"),
    ("breathing", F.respRate, "per minute", "Daily signals"), ("temperature", F.wristTemp, "°C", "Daily signals"),
    ("walkingSpeed", F.walkingSpeed, "m/s", "Daily signals"), ("activeHours", F.activeHours, "hours", "Daily signals"),
    ("efficiency", F.sleepEfficiency, "share", "Daily signals"), ("timeAway", F.awayHours, "hours", "Places"),
    ("places", F.placesVisited, "places", "Places"), ("foodEnergy", F.dietaryEnergy, "kcal", "Nutrition"),
    ("water", F.dietaryWater, "mL", "Nutrition"), ("protein", F.dietaryProtein, "g", "Nutrition"),
    ("carbs", F.dietaryCarbs, "g", "Nutrition"), ("fat", F.dietaryFat, "g", "Nutrition"),
    ("mindful", F.mindfulMin, "minutes", "Mind"), ("stateOfMind", F.stateOfMindValence, "valence", "Mind"),
    ("phq9", F.phq9, "/ 27", "Mind"), ("gad7", F.gad7, "/ 21", "Mind"),
]
let contextKeys = Set(metrics.filter { $0.group == "Nutrition" || $0.group == "Mind" }.map(\.key))

/// BesidePresentation.planningTable: Nutrition and Mind are context, not scoring inputs.
func planningTable(_ source: FeatureTable) -> FeatureTable {
    var result = FeatureTable()
    for (key, series) in source.numbers where !contextKeys.contains(key) {
        for (day, value) in series { result.set(key, day, value) }
    }
    for (key, series) in source.texts { for (day, value) in series { result.setText(key, day, value) } }
    return result
}

/// BesidePresentation.spreadMinutes.
func spreadMinutes(_ table: FeatureTable, _ key: String, endingOn end: Day, days: Int = 7) -> Double? {
    let values = (0..<days).compactMap { table.value(key, end - $0) }
    guard values.count >= max(4, days / 2) else { return nil }
    func median(_ xs: [Double]) -> Double { let s = xs.sorted(); return s.count % 2 == 1 ? s[s.count / 2] : (s[s.count / 2 - 1] + s[s.count / 2]) / 2 }
    let mid = median(values)
    return median(values.map { abs($0 - mid) }) * 1.4826 * 60
}

func r(_ x: Double, _ places: Double = 10) -> Double { (x * places).rounded() / places }

func entry(offset: Int, day: Day, signalDay: Day, table: FeatureTable, history: [StepDay]) -> [String: Any] {
    var out: [String: Any] = ["o": offset]
    let signal = history.first { $0.day == signalDay }
    if let signal {
        if let s = signal.result.steadiness { out["bal"] = r(s) }
        out["step"] = signal.step.rawValue
        out["base"] = signal.baselineDay != nil
        out["drift"] = signal.driftDaysInLastWeek
        var scores: [String: Double] = [:]
        for (kind, value) in signal.result.scores { scores[kind.rawValue] = r(value) }
        out["sc"] = scores
    }
    var readings: [String: Double] = [:]
    for m in metrics { if let v = table.value(m.key, day) { readings[m.id] = r(v, 1000) } }
    out["r"] = readings
    // BesideBalanceTrend: the last 28 days up to the signal day, with a 7-day average once 4 days exist.
    let days = history.filter { $0.day <= signalDay && $0.day > signalDay - 28 && $0.result.steadiness != nil }.sorted { $0.day < $1.day }
    out["chart"] = days.map { d -> [Any] in
        let week = history.filter { $0.day <= d.day && $0.day > d.day - 7 }.compactMap(\.result.steadiness)
        let avg: Any = week.count >= 4 ? r(week.reduce(0, +) / Double(week.count)) : NSNull()
        return [today - d.day, r(d.result.steadiness!), avg]
    }
    for (name, key) in [("bed", F.bedtime), ("wake", F.wake)] {
        if let week = spreadMinutes(table, key, endingOn: day) {
            let usual = spreadMinutes(table, key, endingOn: day - 7, days: 28)
            out[name] = [r(week, 1), usual.map { r($0, 1) as Any } ?? NSNull()]
        }
    }
    return out
}

var sets: [String: [[String: Any]]] = [:]

// TrendScenario (BesidePresentation.swift): loads 0, 0.65 and 1, rebuilt for each selected day.
// Steady and A few harder days use the steady part of the simulated history; A harder stretch keeps the
// history's own 15-day drift (usesDriftHistory). Measured on the day: about 89, 66 and 44.
for (name, load, usesDriftHistory) in [("steady", 0.0, false), ("someHarderDays", 0.65, false), ("harderStretch", 1.0, true)] {
    sets[name] = (0...browseDays).map { o in
        let day = today - o
        var table = usesDriftHistory
            ? SimulatedSource.table(endingOn: day, homeTimeZone: homeTimeZone)
            : SimulatedSource.table(endingOn: day + 15, homeTimeZone: homeTimeZone).truncated(through: day)
        let change = DemoScenarioRules.table(ending: day, load: load, source: table)
        for (key, series) in change.numbers { for (d, value) in series { table.set(key, d, value) } }
        let history = StepEngine.run(table: planningTable(table), through: day, homeTimeZone: homeTimeZone, locationEnabled: true)
        return entry(offset: o, day: day, signalDay: day, table: table, history: history)
    }
}

let metricInfo = metrics.map { m -> [String: String] in
    ["id": m.id, "title": FeatureCatalog.byKey[m.key]?.title ?? m.id, "unit": m.unit, "group": m.group]
}
let c = today.components
let json: [String: Any] = [
    "generated": String(format: "%04d-%02d-%02d", c.year, c.month, c.day),
    "note": "Generated by tools/fixture-export from the MindMaintainer engine. Offsets count days back from today.",
    "metrics": metricInfo,
    "sets": sets,
]
let data = try JSONSerialization.data(withJSONObject: json, options: [.sortedKeys])
FileHandle.standardOutput.write("window.MIND_TRENDS = ".data(using: .utf8)!)
FileHandle.standardOutput.write(data)
FileHandle.standardOutput.write(";\n".data(using: .utf8)!)
