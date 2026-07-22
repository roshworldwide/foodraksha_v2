"use client";

import {
  Button,
  Input,
  Label,
  List,
  ListRow,
  Select,
  Textarea,
  Toggle,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { FieldDef, SubFieldDef } from "@/lib/fields";
import type { AnswerValue, GroupRow } from "@/lib/questionnaire/schema";

export interface FieldControlProps {
  field: FieldDef;
  value: AnswerValue | undefined;
  onChange: (value: AnswerValue) => void;
  invalid: boolean;
  disabled: boolean;
  describedBy?: string;
}

const inputTypeFor: Partial<Record<FieldDef["type"], string>> = {
  text: "text",
  tel: "tel",
  email: "email",
  number: "number",
  date: "date",
};

/**
 * One input, chosen by the field's `type`. Every branch here is generic —
 * nothing keys off a specific field name, so a new question is a database
 * change and nothing more.
 */
export function FieldControl(props: FieldControlProps) {
  const { field, value, onChange, invalid, disabled, describedBy } = props;

  switch (field.type) {
    case "multiline":
      return (
        <Textarea
          id={field.key}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
        />
      );

    case "select":
      return (
        <Select
          id={field.key}
          value={typeof value === "string" ? value : ""}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
        >
          <option value="">Select {field.label.toLowerCase()}</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </Select>
      );

    case "radio":
      return (
        <ChoiceList
          field={field}
          selected={typeof value === "string" ? [value] : []}
          multiple={false}
          onToggle={(option) => onChange(option)}
          invalid={invalid}
          disabled={disabled}
          describedBy={describedBy}
        />
      );

    case "multiselect": {
      const selected = Array.isArray(value) ? (value as string[]) : [];
      return (
        <ChoiceList
          field={field}
          selected={selected.filter((item) => typeof item === "string")}
          multiple
          onToggle={(option) =>
            onChange(
              selected.includes(option)
                ? selected.filter((item) => item !== option)
                : [...selected, option],
            )
          }
          invalid={invalid}
          disabled={disabled}
          describedBy={describedBy}
        />
      );
    }

    case "checkbox":
      return (
        <List>
          <ListRow
            title={<span id={`${field.key}-switch-label`}>{field.label}</span>}
            trailing={
              <Toggle
                checked={value === true}
                onCheckedChange={onChange}
                disabled={disabled}
                labelledBy={`${field.key}-switch-label`}
              />
            }
          />
        </List>
      );

    case "group":
      return (
        <RepeatableGroup
          field={field}
          rows={Array.isArray(value) ? (value as GroupRow[]) : []}
          onChange={onChange}
          disabled={disabled}
        />
      );

    case "file":
    case "signature":
      return (
        <div className="rounded-input border-[0.5px] border-dashed border-separator bg-white-titanium-lt px-4 py-[14px] text-subhead text-label-2">
          Upload this in the Documents section, where you can drag a file in or
          take a photograph.
        </div>
      );

    default:
      return (
        <Input
          id={field.key}
          type={inputTypeFor[field.type] ?? "text"}
          inputMode={field.type === "tel" ? "numeric" : undefined}
          value={
            typeof value === "string" || typeof value === "number"
              ? String(value)
              : ""
          }
          onChange={(event) =>
            onChange(
              field.type === "number"
                ? event.target.value === ""
                  ? ""
                  : Number(event.target.value)
                : event.target.value,
            )
          }
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={disabled}
        />
      );
  }
}

/* ───────────────────────────────────────────────── radio / multiselect */

function ChoiceList({
  field,
  selected,
  multiple,
  onToggle,
  invalid,
  disabled,
  describedBy,
}: {
  field: FieldDef;
  selected: string[];
  multiple: boolean;
  onToggle: (option: string) => void;
  invalid: boolean;
  disabled: boolean;
  describedBy?: string;
}) {
  return (
    <div
      role={multiple ? "group" : "radiogroup"}
      aria-labelledby={`${field.key}-label`}
      aria-describedby={describedBy}
      aria-invalid={invalid}
    >
      <List>
        {field.options?.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <ListRow
              key={option}
              onClick={disabled ? undefined : () => onToggle(option)}
              title={
                <span
                  role={multiple ? "checkbox" : "radio"}
                  aria-checked={isSelected}
                  className={cn(isSelected && "font-semibold")}
                >
                  {option}
                </span>
              }
              trailing={
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-[17px] font-semibold",
                    isSelected ? "text-graphite" : "text-transparent",
                  )}
                >
                  ✓
                </span>
              }
            />
          );
        })}
      </List>
    </div>
  );
}

/* ────────────────────────────────────────────────── repeatable group */

function emptyRow(subFields: SubFieldDef[]): GroupRow {
  return Object.fromEntries(subFields.map((subField) => [subField.key, ""]));
}

function RepeatableGroup({
  field,
  rows,
  onChange,
  disabled,
}: {
  field: FieldDef;
  rows: GroupRow[];
  onChange: (value: AnswerValue) => void;
  disabled: boolean;
}) {
  const subFields = field.itemFields ?? [];
  const itemLabel = field.itemLabel ?? "item";

  function updateRow(index: number, key: string, next: string | number) {
    const copy = rows.map((row, position) =>
      position === index ? { ...row, [key]: next } : row,
    );
    onChange(copy);
  }

  return (
    <div>
      {rows.length > 0 && (
        <ul className="mb-3 overflow-hidden rounded-list bg-surface shadow-1">
          {rows.map((row, index) => (
            <li
              key={index}
              className="border-b-[0.5px] border-separator p-4 last:border-b-0"
            >
              <div className="mb-2.5 flex items-center justify-between">
                <span className="text-footnote font-semibold text-label-2 uppercase">
                  {itemLabel} {index + 1}
                </span>
                <Button
                  variant="quiet"
                  size="xs"
                  disabled={disabled}
                  onClick={() =>
                    onChange(rows.filter((_, position) => position !== index))
                  }
                >
                  Remove
                </Button>
              </div>

              <div className="grid gap-x-4 [grid-template-columns:repeat(auto-fit,minmax(200px,1fr))]">
                {subFields.map((subField) => {
                  const id = `${field.key}-${index}-${subField.key}`;
                  return (
                    <div key={subField.key} className="mb-3 last:mb-0">
                      <Label htmlFor={id} className="mb-[7px]">
                        {subField.label}
                      </Label>
                      {subField.type === "select" ? (
                        <Select
                          id={id}
                          value={String(row[subField.key] ?? "")}
                          disabled={disabled}
                          onChange={(event) =>
                            updateRow(index, subField.key, event.target.value)
                          }
                        >
                          <option value="">
                            Select {subField.label.toLowerCase()}
                          </option>
                          {subField.options?.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </Select>
                      ) : (
                        <Input
                          id={id}
                          type={inputTypeFor[subField.type] ?? "text"}
                          value={String(row[subField.key] ?? "")}
                          disabled={disabled}
                          onChange={(event) =>
                            updateRow(
                              index,
                              subField.key,
                              subField.type === "number"
                                ? event.target.value === ""
                                  ? ""
                                  : Number(event.target.value)
                                : event.target.value,
                            )
                          }
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <Button
        variant="quiet"
        size="sm"
        disabled={disabled}
        onClick={() => onChange([...rows, emptyRow(subFields)])}
      >
        Add {itemLabel}
      </Button>
    </div>
  );
}
