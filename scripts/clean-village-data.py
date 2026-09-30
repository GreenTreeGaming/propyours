#!/usr/bin/env python3
"""Convert the LGD fixed-width CSV export into normalized CSV and JSON data."""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import defaultdict
from pathlib import Path


ROW_PATTERN = re.compile(
    r"^\s*(\d+)\s+(.+?)\s+(\d+)\s+(.+?)\s+(\d+)\s+(.+?)\s*$"
)


def clean_text(value: str) -> str:
    return " ".join(value.split())


def display_name(value: str) -> str:
    value = clean_text(value)
    value = value.title() if value.isupper() else value

    # LGD contains a small number of numbered revenue villages whose official
    # labels begin with the number (for example, "101 Pudhukkudi"). Keep the
    # distinguishing number, but move it after the readable place name so the
    # website sorts and scans naturally.
    numbered = re.match(r"^(\d+)\s*[,.-]?\s*(.+)$", value)
    if numbered:
        number, name = numbered.groups()
        value = f"{clean_text(name)} ({number})"

    numbered_name = re.match(r"^No\.\s*(\d+)\s+(.+)$", value, re.IGNORECASE)
    if numbered_name:
        number, name = numbered_name.groups()
        value = f"{clean_text(name)} (No. {number})"

    # Preserve meaningful initial qualifiers while presenting their spacing
    # consistently: "A.Agaram" becomes "A. Agaram".
    value = re.sub(r"^([A-Za-z])\.(?=[A-Za-z])", r"\1. ", value)
    value = re.sub(
        r"^([A-Za-z]\.\s+)([a-z])",
        lambda match: match.group(1).upper() + match.group(2).upper(),
        value,
    )
    return value


def parse(source: Path) -> list[dict[str, str]]:
    records: list[dict[str, str]] = []
    malformed_numeric_rows: list[tuple[int, str]] = []

    with source.open(newline="", encoding="utf-8-sig") as handle:
        for line_number, row in enumerate(csv.reader(handle), start=1):
            text = clean_text(" ".join(row))
            if not text:
                continue

            match = ROW_PATTERN.match(text)
            if not match:
                if any(character.isdigit() for character in text):
                    malformed_numeric_rows.append((line_number, text))
                continue

            district_code, district_name, block_code, block_name, village_code, village_name = (
                clean_text(value) for value in match.groups()
            )
            records.append(
                {
                    "district_code": district_code,
                    "district_name": district_name,
                    "block_code": block_code,
                    "block_name": block_name,
                    "village_code": village_code,
                    "village_name": village_name,
                }
            )

    if malformed_numeric_rows:
        examples = "\n".join(
            f"line {line_number}: {text}"
            for line_number, text in malformed_numeric_rows[:10]
        )
        raise ValueError(
            f"Found {len(malformed_numeric_rows)} unparsed data rows:\n{examples}"
        )

    unique_by_village_code: dict[str, dict[str, str]] = {}
    for record in records:
        code = record["village_code"]
        existing = unique_by_village_code.get(code)
        if existing and existing != record:
            raise ValueError(f"Village code {code} has conflicting records")
        unique_by_village_code[code] = record

    return sorted(
        unique_by_village_code.values(),
        key=lambda row: (
            row["district_name"].casefold(),
            row["block_name"].casefold(),
            row["village_name"].casefold(),
            int(row["village_code"]),
        ),
    )


def write_csv(records: list[dict[str, str]], destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "district_code",
        "district_name",
        "block_code",
        "block_name",
        "village_code",
        "village_name",
    ]
    with destination.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)


def write_json(records: list[dict[str, str]], destination: Path) -> None:
    hierarchy: dict[tuple[str, str], dict[tuple[str, str], list[dict[str, str]]]] = defaultdict(
        lambda: defaultdict(list)
    )

    for record in records:
        district_key = (record["district_code"], record["district_name"])
        block_key = (record["block_code"], record["block_name"])
        hierarchy[district_key][block_key].append(
            {
                "code": record["village_code"],
                "name": display_name(record["village_name"]),
            }
        )

    districts = []
    for (district_code, district_name), blocks in sorted(
        hierarchy.items(), key=lambda item: item[0][1].casefold()
    ):
        district_blocks = []
        for (block_code, block_name), villages in sorted(
            blocks.items(), key=lambda item: item[0][1].casefold()
        ):
            district_blocks.append(
                {
                    "code": block_code,
                    "name": display_name(block_name),
                    "villages": sorted(villages, key=lambda item: item["name"].casefold()),
                }
            )
        districts.append(
            {
                "code": district_code,
                "name": display_name(district_name),
                "blocks": district_blocks,
            }
        )

    payload = {
        "summary": {
            "districts": len(districts),
            "blocks": sum(len(district["blocks"]) for district in districts),
            "villages": len(records),
        },
        "districts": districts,
    }
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_text(
        json.dumps(payload, ensure_ascii=False, separators=(",", ":")) + "\n",
        encoding="utf-8",
    )


def main() -> None:
    if len(sys.argv) != 4:
        raise SystemExit(
            "Usage: clean-village-data.py SOURCE.csv CLEAN.csv WEBSITE.json"
        )

    source, csv_destination, json_destination = map(Path, sys.argv[1:])
    records = parse(source)
    write_csv(records, csv_destination)
    write_json(records, json_destination)
    print(
        json.dumps(
            {
                "records": len(records),
                "csv": str(csv_destination),
                "json": str(json_destination),
            }
        )
    )


if __name__ == "__main__":
    main()
