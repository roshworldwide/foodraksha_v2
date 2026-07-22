import { Document, Page, Text, View } from "@react-pdf/renderer";
import { BLANK, type AnnexureContext } from "@/lib/annexures/data";
import { Letterhead, SignatureLine, styles } from "./shared";

/**
 * Self-Declaration for Proprietorship.
 *
 * Follows the FSSAI format at
 * https://foscos.fssai.gov.in/assets/docs/AffidavitofProprietorship_27.pdf
 * (copy in docs/forms/AFFIDAVIT_OF_PROPRIETORSHIP.pdf), which is explicitly
 * "to be given on the Letterhead of the FBO/Firm/Company".
 *
 * Father's or spouse's name and the proprietor's residential address are not
 * asked anywhere in the questionnaire, so they print as ruled lines for the
 * proprietor to complete when signing.
 */
export function ProprietorDeclaration({ data }: { data: AnnexureContext }) {
  const nominee = data.nominees[0];

  return (
    <Document
      title={`Self-Declaration for Proprietorship — ${data.applicationNo}`}
      author="FoodRaksha"
      creator="FoodRaksha"
      producer="FoodRaksha"
      creationDate={data.documentDate}
      modificationDate={data.documentDate}
    >
      <Page size="A4" style={styles.page}>
        <Letterhead letterhead={data.letterhead} />

        <Text style={styles.title}>Self - Declaration for Proprietorship</Text>
        <Text style={[styles.centred, styles.small]}>
          (To be given on the Letterhead of the FBO/Firm/Company)
        </Text>

        <Text style={{ marginTop: 10, marginBottom: 14 }}>
          I, {data.applicant.name} S/o/D/o/W/o {BLANK} R/o {BLANK}, do hereby
          state and affirm as follows:-
        </Text>

        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Text style={{ width: 22 }}>1.</Text>
          <Text style={{ flex: 1, textAlign: "justify" }}>
            I am the sole owner/ proprietor of a business operating under the
            name and style &ldquo;{data.business.legalName}&rdquo; operating
            from {data.premisesAddress};
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 10 }}>
          <Text style={{ width: 22 }}>2.</Text>
          <Text style={{ flex: 1, textAlign: "justify" }}>
            This business is not undertaken/ operated by a partnership firm or
            limited liability company.
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 6 }}>
          <Text style={{ width: 22 }}>3.</Text>
          <Text style={{ flex: 1, textAlign: "justify" }}>
            It is also to declare that below mentioned person is my legal
            nominee for the said proprietorship concern-
          </Text>
        </View>
        <View style={{ marginLeft: 22, marginBottom: 12 }}>
          <Text>Name: {nominee?.name ?? BLANK}</Text>
          <Text style={{ marginTop: 6 }}>
            Relationship with the proprietor: {BLANK}
          </Text>
        </View>

        <View style={{ flexDirection: "row", marginBottom: 16 }}>
          <Text style={{ width: 22 }}>4.</Text>
          <Text style={{ flex: 1, textAlign: "justify" }}>
            That the contents of this declaration are true and correct to the
            best of my knowledge and belief.
          </Text>
        </View>

        {/* The signature block is a table in the official format. */}
        <View style={styles.table}>
          <View style={styles.tr}>
            <View style={[styles.td, { width: "45%", height: 74 }]}>
              <Text> </Text>
            </View>
            <View style={[styles.td, { width: "55%", height: 74 }]}>
              <Text>Signatures of the proprietor with Stamp/ Seal</Text>
              <View style={{ marginTop: 4 }}>
                <SignatureLine signature={data.signature} caption=" " />
              </View>
            </View>
          </View>
          <View style={styles.tr}>
            <View style={[styles.td, { width: "45%" }]}>
              <Text> </Text>
            </View>
            <Text style={[styles.td, { width: "55%" }]}>
              Name: {data.applicant.name}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "45%" }]}>
              Place: {data.place}
            </Text>
            <Text style={[styles.td, { width: "55%" }]}>
              Address: {data.premisesAddress}
            </Text>
          </View>
          <View style={styles.tr}>
            <Text style={[styles.td, { width: "45%" }]}>Date: {data.date}</Text>
            <Text style={[styles.td, { width: "55%" }]}>
              Contact Nos: {data.applicant.mobile}
            </Text>
          </View>
        </View>

        <Text style={styles.footerNote} fixed>
          {data.applicationNo} · Self-Declaration for Proprietorship · generated
          by FoodRaksha
        </Text>
      </Page>
    </Document>
  );
}
