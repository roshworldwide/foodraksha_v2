import path from "node:path";
import {
  Font,
  Image,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import type { AnnexureLetterhead } from "@/lib/annexures/data";

/**
 * Shared print styling. A4 with 20mm margins — inside every desktop printer's
 * unprintable edge, because these documents get physically filed.
 *
 * Fonts are embedded from files committed to the repository, so a generated
 * annexure looks the same on every machine and needs no network.
 */

const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");

Font.register({
  family: "Inter",
  fonts: [
    { src: path.join(FONT_DIR, "Inter-Regular.ttf"), fontWeight: 400 },
    { src: path.join(FONT_DIR, "Inter-Bold.ttf"), fontWeight: 700 },
  ],
});

// Long unbroken values (application numbers, GSTINs) should wrap rather than
// run off the page.
Font.registerHyphenationCallback((word) => [word]);

export const A4_MARGIN = "20mm";

export const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.5,
    color: "#000000",
    paddingTop: A4_MARGIN,
    paddingBottom: A4_MARGIN,
    paddingHorizontal: A4_MARGIN,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: 700,
    textAlign: "center",
    marginBottom: 6,
  },
  centred: { textAlign: "center", marginBottom: 10 },
  paragraph: { marginBottom: 10, textAlign: "justify" },
  spacer: { height: 14 },
  row: { flexDirection: "row" },
  betweenRow: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: 700 },
  small: { fontSize: 9 },
  // Tables
  table: {
    marginTop: 8,
    borderTop: "1pt solid #000",
    borderLeft: "1pt solid #000",
  },
  tr: { flexDirection: "row" },
  th: {
    borderRight: "1pt solid #000",
    borderBottom: "1pt solid #000",
    padding: 4,
    fontWeight: 700,
    fontSize: 9.5,
  },
  td: {
    borderRight: "1pt solid #000",
    borderBottom: "1pt solid #000",
    padding: 4,
    fontSize: 9.5,
  },
  signatureBlock: { marginTop: 28 },
  signatureImage: { width: 150, height: 45, objectFit: "contain" },
  footerNote: {
    position: "absolute",
    bottom: 10,
    left: A4_MARGIN,
    right: A4_MARGIN,
    fontSize: 7.5,
    color: "#555555",
    textAlign: "center",
  },
});

/**
 * The client's letterhead. FSSAI guidance requires it to carry the company
 * name, address, contact details and CIN — so those four are always printed,
 * as blank lines when unknown.
 */
export function Letterhead({ letterhead }: { letterhead: AnnexureLetterhead }) {
  return (
    <View
      style={{
        borderBottom: "1.5pt solid #000",
        paddingBottom: 8,
        marginBottom: 16,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      {letterhead.logo && (
        <Image
          src={letterhead.logo}
          style={{ width: 56, height: 56, objectFit: "contain" }}
        />
      )}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 14, fontWeight: 700 }}>{letterhead.name}</Text>
        <Text style={styles.small}>{letterhead.address}</Text>
        <Text style={styles.small}>{letterhead.contact}</Text>
        <Text style={styles.small}>CIN: {letterhead.cin}</Text>
      </View>
    </View>
  );
}

/** Signature image where we have one, a ruled line where we do not. */
export function SignatureLine({
  signature,
  caption,
}: {
  signature: string | null;
  caption: string;
}) {
  return (
    <View>
      {signature ? (
        <Image src={signature} style={styles.signatureImage} />
      ) : (
        <View style={{ height: 45, justifyContent: "flex-end" }}>
          <Text> </Text>
        </View>
      )}
      <View style={{ width: 170, borderTop: "1pt solid #000", paddingTop: 3 }}>
        <Text style={styles.small}>{caption}</Text>
      </View>
    </View>
  );
}

/**
 * The FoodRaksha mark, drawn as vector so it stays crisp at any size and needs
 * no image asset. Keeps its blue/green — the only colour on the page.
 * TODO(brand): align with the official mark when the vector is supplied.
 */
export function FoodRakshaMark({ size = 10 }: { size?: number }) {
  return (
    <Svg viewBox="0 0 48 48" width={size} height={size}>
      <Path
        d="M24 3.2l16.2 5.6a1.6 1.6 0 0 1 1.1 1.5v11.9c0 9.9-6.9 18.5-16.7 21.5a2 2 0 0 1-1.2 0C13.6 40.7 6.7 32.1 6.7 22.2V10.3a1.6 1.6 0 0 1 1.1-1.5z"
        fill="#1E4FA8"
      />
      <Path
        d="M24 13.2c5.9 0 10.7 4.4 10.7 10.6 0 5.2-3.6 9.8-9.4 11.2a1 1 0 0 1-1.2-.8c-1-5.6.4-10.9 4.6-15.1a.6.6 0 0 0-.8-.9c-4.2 2.9-6.6 6.8-7.4 11.6-1.9-2-3.2-4.7-3.2-7.9 0-6.2 4.8-9.8 6.1-9.8z"
        fill="#43A57A"
      />
    </Svg>
  );
}

/** A fixed footer with the FoodRaksha mark and a caption line. */
export function PdfFooter({ children }: { children: React.ReactNode }) {
  return (
    <View
      fixed
      style={{
        position: "absolute",
        bottom: 10,
        left: A4_MARGIN,
        right: A4_MARGIN,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
      }}
    >
      <FoodRakshaMark size={9} />
      <Text style={{ fontSize: 7.5, color: "#555555" }}>{children}</Text>
    </View>
  );
}
