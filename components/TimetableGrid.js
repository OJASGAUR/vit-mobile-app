// vit-mobile-app/components/TimetableGrid.js
import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function EventCard({ event }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <Text style={styles.code}>{event.courseCode}</Text>
        <View style={styles.pill}><Text style={styles.pillText}>{event.slot || ""}</Text></View>
      </View>
      <Text style={styles.name} numberOfLines={2}>{event.courseName}</Text>
      <Text style={styles.meta}>{event.start} - {event.end} • {event.venue || "NIL"}</Text>
    </View>
  );
}

export default function TimetableGrid({ timetable = {}, weekView = false, singleDay = false, day }) {
  function timeToMinutes(t) {
    if (!t) return null;
    const m = t.split(":");
    if (m.length < 2) return null;
    return parseInt(m[0], 10) * 60 + parseInt(m[1], 10);
  }

  function isLabEvent(ev) {
    if (!ev) return false;
    if (ev.slot && typeof ev.slot === "string" && ev.slot.trim().toUpperCase().startsWith("L")) return true;
    if (ev.courseName && typeof ev.courseName === "string" && /lab/i.test(ev.courseName)) return true;
    return false;
  }

  // Extract the numeric part of a lab slot (L37 -> 37). Only use the FIRST part if "L37+L38".
  function getLabSlotNumber(ev) {
    if (!ev || !ev.slot || typeof ev.slot !== "string") return null;
    const firstPart = ev.slot.split("+")[0].trim().toUpperCase(); // e.g. "L37" from "L37+L38"
    const match = /^L(\d+)$/.exec(firstPart);
    if (!match) return null;
    const n = parseInt(match[1], 10);
    return Number.isNaN(n) ? null : n;
  }

  // Decide if two events should be merged as a lab pair like L37+L38, L39+L40, etc.
  function canMergeLabPair(cur, nxt) {
    if (!cur || !nxt) return false;

    // Both must be labs
    if (!(isLabEvent(cur) && isLabEvent(nxt))) return false;

    // Same course (subject)
    if (!cur.courseCode || !nxt.courseCode || cur.courseCode !== nxt.courseCode) return false;

    // Optional: same venue if both exist
    if (cur.venue && nxt.venue && cur.venue !== nxt.venue) return false;

    // Check slot pair: L(odd) + L(odd+1)
    const n1 = getLabSlotNumber(cur);
    const n2 = getLabSlotNumber(nxt);
    if (n1 == null || n2 == null) return false;

    // e.g. 37 & 38, 39 & 40, 41 & 42 ... (odd followed by next even)
    if (n1 % 2 === 1 && n2 === n1 + 1) {
      return true;
    }

    return false;
  }

  function mergeConsecutiveLabs(events = []) {
    if (!Array.isArray(events) || events.length === 0) return [];

    // shallow copy and sort by start time for consistent order
    const arr = events.slice().sort((a, b) => (timeToMinutes(a.start) || 0) - (timeToMinutes(b.start) || 0));
    const res = [];
    let cur = { ...arr[0] };

    for (let i = 1; i < arr.length; i++) {
      const nxt = arr[i];

      if (canMergeLabPair(cur, nxt)) {
        // Merge nxt into cur as a lab block
        cur.end = nxt.end || cur.end;

        if (cur.slot && nxt.slot) {
          // Avoid double "++" if already merged; but normally these are single slots
          cur.slot = `${cur.slot}+${nxt.slot}`;
        } else if (!cur.slot && nxt.slot) {
          cur.slot = nxt.slot;
        }

        // If venues somehow differ and we allowed merge, concatenate
        if (cur.venue && nxt.venue && cur.venue !== nxt.venue) {
          cur.venue = `${cur.venue}+${nxt.venue}`;
        } else if (!cur.venue && nxt.venue) {
          cur.venue = nxt.venue;
        }

        // Do NOT push yet; we keep extending cur
      } else {
        // push finished block and start a new one
        res.push(cur);
        cur = { ...nxt };
      }
    }

    res.push(cur);
    return res;
  }

  if (singleDay) {
    const dayName = day || "Monday";
    const events = timetable[dayName] || [];
    const merged = mergeConsecutiveLabs(events);
    return (
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 24 }}>
        {merged.length === 0
          ? <Text style={styles.emptyLarge}>No classes</Text>
          : merged.map((ev, i) => <EventCard key={`${ev.courseCode}-${i}`} event={ev} />)}
      </ScrollView>
    );
  }

  if (weekView) {
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 12 }}>
        {DAYS.map((d) => (
          <View key={d} style={styles.col}>
            <Text style={styles.colTitle}>{d.slice(0, 3)}</Text>
            <ScrollView style={styles.colBody} contentContainerStyle={{ paddingBottom: 24 }}>
              {((timetable[d] || []).length === 0)
                ? <Text style={styles.empty}>—</Text>
                : mergeConsecutiveLabs(timetable[d]).map((ev, i) => <EventCard key={`${d}-${i}`} event={ev} />)}
            </ScrollView>
          </View>
        ))}
      </ScrollView>
    );
  }

  // compact grid (two columns)
  return (
    <View style={styles.gridWrap}>
      {DAYS.map(d => (
        <View key={d} style={styles.gridCol}>
          <Text style={styles.dayTitle}>{d.slice(0, 3)}</Text>
          <View style={styles.dayBody}>
            {mergeConsecutiveLabs(timetable[d] || []).slice(0, 4).map((ev, i) => <EventCard key={`${d}-${i}`} event={ev} />)}
            {(timetable[d] || []).length === 0 && <Text style={styles.empty}>—</Text>}
          </View>
        </View>
      ))}
    </View>
  );
}

const W = Dimensions.get("window").width;
const styles = StyleSheet.create({
  gridWrap: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", padding: 12 },
  gridCol: { width: "48%", marginBottom: 12 },
  dayTitle: { fontWeight: "800", color: "#fff", marginBottom: 8 },
  dayBody: { backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 12, minHeight: 80 },
  col: { width: Math.min(280, Math.floor(W * 0.7)), marginRight: 12 },
  colTitle: { fontWeight: "900", color: "#fff", marginBottom: 8 },
  colBody: { backgroundColor: "rgba(255,255,255,0.03)", padding: 10, borderRadius: 12, minHeight: 120 },

  card: {
    backgroundColor: "rgba(7,20,30,0.95)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "rgba(0,122,255,0.95)",
    shadowColor: "#000",
    shadowOpacity: 0.22,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  code: { fontWeight: "900", color: "#d7f0ff" },
  name: { marginTop: 6, color: "#eaf4ff", fontSize: 14, fontWeight: "700" },
  meta: { marginTop: 8, color: "#b7d6ef", fontSize: 12 },

  pill: { backgroundColor: "rgba(255,255,255,0.03)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  pillText: { color: "#dbefff", fontWeight: "700" },

  empty: { color: "#99aab3" },
  emptyLarge: { color: "#99aab3", padding: 24, textAlign: "center" },
});
