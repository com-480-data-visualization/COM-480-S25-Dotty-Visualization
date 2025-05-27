import ref_3_6_4 from "../data/references/3.6.4.csv"
import ref_3_6_3 from "../data/references/3.6.3.csv"
import ref_3_6_2 from "../data/references/3.6.2.csv"
import ref_3_5_2 from "../data/references/3.5.2.csv"
import ref_3_5_1 from "../data/references/3.5.1.csv"
import ref_3_5_0 from "../data/references/3.5.0.csv"
import ref_3_4_3 from "../data/references/3.4.3.csv"
import ref_3_4_2 from "../data/references/3.4.2.csv"
import ref_3_4_1 from "../data/references/3.4.1.csv"
import ref_3_4_0 from "../data/references/3.4.0.csv"
import ref_3_3_6 from "../data/references/3.3.6.csv"
import ref_3_3_5 from "../data/references/3.3.5.csv"
import ref_3_3_4 from "../data/references/3.3.4.csv"
import ref_3_3_3 from "../data/references/3.3.3.csv"
import ref_3_3_1 from "../data/references/3.3.1.csv"
import ref_3_3_0 from "../data/references/3.3.0.csv"
import ref_3_2_2 from "../data/references/3.2.2.csv"
import ref_3_2_1 from "../data/references/3.2.1.csv"
import ref_3_2_0 from "../data/references/3.2.0.csv"
import ref_3_1_3 from "../data/references/3.1.3.csv"
import ref_3_1_2 from "../data/references/3.1.2.csv"
import ref_3_1_1 from "../data/references/3.1.1.csv"
import ref_3_1_0 from "../data/references/3.1.0.csv"
import ref_3_0_2 from "../data/references/3.0.2.csv"
import ref_3_0_1 from "../data/references/3.0.1.csv"
import ref_3_0_0 from "../data/references/3.0.0.csv"

function transformCSVWithHeaders(rows) {
    const headers = rows[0];
    return rows.slice(1).map(row => Object.fromEntries(row.map((cell, index) => [headers[index], cell])))
}

export const references = {
    "3.6.4": transformCSVWithHeaders(ref_3_6_4),
    "3.6.3": transformCSVWithHeaders(ref_3_6_3),
    "3.6.2": transformCSVWithHeaders(ref_3_6_2),
    "3.5.2": transformCSVWithHeaders(ref_3_5_2),
    "3.5.1": transformCSVWithHeaders(ref_3_5_1),
    "3.5.0": transformCSVWithHeaders(ref_3_5_0),
    "3.4.3": transformCSVWithHeaders(ref_3_4_3),
    "3.4.2": transformCSVWithHeaders(ref_3_4_2),
    "3.4.1": transformCSVWithHeaders(ref_3_4_1),
    "3.4.0": transformCSVWithHeaders(ref_3_4_0),
    "3.3.6": transformCSVWithHeaders(ref_3_3_6),
    "3.3.5": transformCSVWithHeaders(ref_3_3_5),
    "3.3.4": transformCSVWithHeaders(ref_3_3_4),
    "3.3.3": transformCSVWithHeaders(ref_3_3_3),
    "3.3.1": transformCSVWithHeaders(ref_3_3_1),
    "3.3.0": transformCSVWithHeaders(ref_3_3_0),
    "3.2.2": transformCSVWithHeaders(ref_3_2_2),
    "3.2.1": transformCSVWithHeaders(ref_3_2_1),
    "3.2.0": transformCSVWithHeaders(ref_3_2_0),
    "3.1.3": transformCSVWithHeaders(ref_3_1_3),
    "3.1.2": transformCSVWithHeaders(ref_3_1_2),
    "3.1.1": transformCSVWithHeaders(ref_3_1_1),
    "3.1.0": transformCSVWithHeaders(ref_3_1_0),
    "3.0.2": transformCSVWithHeaders(ref_3_0_2),
    "3.0.1": transformCSVWithHeaders(ref_3_0_1),
    "3.0.0": transformCSVWithHeaders(ref_3_0_0),
}
