import { Document, Page, Text, View } from "@react-pdf/renderer";
import { PROPRIETORSHIP } from "@/lib/annexures/applicability";
import type { AnnexureContext } from "@/lib/annexures/data";
import { Letterhead, SignatureLine, styles, PdfFooter } from "./shared";

/**
 * List of Directors / Partners / Proprietor / Executive members, with full
 * addresses, contact details and the nomination of an authorised signatory.
 *
 * Renders on the client's letterhead, which the FSSAI guidance requires to
 * carry the company name, address, contact details and CIN. The heading and
 * the first column follow the constitution, as the guidance sets out:
 * company → Directors, partnership → Partners, individual → Proprietor,
 * society or trust → Executive members.
 */
function headingFor(constitution: string | null): {
  title: string;
  nameColumn: string;
  sealCaption: string;
} {
  switch (constitution) {
    case "Partnership":
    case "LLP":
      return {
        title: "List of Partners",
        nameColumn: "Name of the partners*",
        sealCaption: "(Along with seal of Partnership firm)",
      };
    case PROPRIETORSHIP:
      return {
        title: "List of Proprietor",
        nameColumn: "Name of the proprietor*",
        sealCaption: "(Along with seal of the firm)",
      };
    case "Society":
    case "Trust":
      return {
        title: "List of Members, Society/Trust",
        nameColumn: "Name of the Director/ Executive members*",
        sealCaption: "(Along with seal of Trust/Society)",
      };
    default:
      return {
        title: "List of Directors",
        nameColumn: "Name and DIN*",
        sealCaption: "(Along with seal of the Company)",
      };
  }
}

const COLUMNS = [
  { key: "sl", label: "Sl no.", width: "7%" },
  { key: "name", label: "", width: "20%" },
  { key: "address", label: "Address*", width: "25%" },
  { key: "contact", label: "Contact no.*", width: "14%" },
  { key: "description", label: "Description*", width: "14%" },
  { key: "id", label: "ID Details", width: "20%" },
] as const;

export function PeopleList({ data }: { data: AnnexureContext }) {
  const heading = headingFor(data.constitution);
  const rows = Math.max(data.people.length, 3);

  return (
    <Document
      title={`${heading.title} — ${data.applicationNo}`}
      author="FoodRaksha"
      creator="FoodRaksha"
      producer="FoodRaksha"
      creationDate={data.documentDate}
      modificationDate={data.documentDate}
    >
      <Page size="A4" style={styles.page}>
        <Letterhead letterhead={data.letterhead} />

        <Text style={styles.title}>{heading.title}</Text>
        <Text style={[styles.centred, styles.small]}>(w.e.f.) {data.date}</Text>

        <View style={styles.table}>
          <View style={styles.tr}>
            {COLUMNS.map((column) => (
              <Text
                key={column.key}
                style={[styles.th, { width: column.width }]}
              >
                {column.key === "name" ? heading.nameColumn : column.label}
              </Text>
            ))}
          </View>

          {Array.from({ length: rows }).map((_, index) => {
            const person = data.people[index];
            return (
              <View key={index} style={styles.tr}>
                <Text style={[styles.td, { width: COLUMNS[0].width }]}>
                  {index + 1}.
                </Text>
                <Text style={[styles.td, { width: COLUMNS[1].width }]}>
                  {person ? person.name : " "}
                </Text>
                <Text style={[styles.td, { width: COLUMNS[2].width }]}>
                  {person ? person.address : " "}
                </Text>
                <Text style={[styles.td, { width: COLUMNS[3].width }]}>
                  {person ? person.contact : " "}
                </Text>
                <Text style={[styles.td, { width: COLUMNS[4].width }]}>
                  {person ? person.designation : " "}
                </Text>
                <Text style={[styles.td, { width: COLUMNS[5].width }]}>
                  {person ? person.idDetails : " "}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={{ height: 26 }} />

        <Text style={styles.bold}>Nomination of Authorised Signatory</Text>
        <Text style={{ marginTop: 6 }}>
          {data.nominees[0]?.name ?? ""} ({data.nominees[0]?.designation ?? ""})
          is hereby nominated as the authorised signatory for{" "}
          {data.business.legalName}, {data.premisesAddress}.
        </Text>

        <View style={{ marginTop: 34, alignItems: "flex-end" }}>
          <SignatureLine
            signature={data.signature}
            caption="Signature of the authorised signatory"
          />
          <Text style={[styles.small, { marginTop: 3 }]}>
            {heading.sealCaption}
          </Text>
        </View>

        <View style={{ marginTop: 20 }}>
          <Text>Place: {data.place}</Text>
          <Text style={{ marginTop: 6 }}>Date: {data.date}</Text>
        </View>

        <PdfFooter>
          {data.applicationNo} · {heading.title} · generated by FoodRaksha
        </PdfFooter>
      </Page>
    </Document>
  );
}
