import {
  Document,
  Font,
  Image,
  Link,
  Page,
  PDFDownloadLink,
  Text,
  View,
} from "@react-pdf/renderer";
import { Button } from "~/components/ui/button";

interface ReceiptProps {
  receiptNumber: string;
  date: string;
  name: string;
  phone: string;
  address: string;
  wing: string;
  amount: number;
}

export default function Receipt({
  receiptNumber,
  date,
  name,
  phone,
  address,
  wing,
  amount,
}: ReceiptProps) {
  if (typeof document === "undefined") {
    return null;
  }

  Font.register({ family: "Geist", src: "/fonts/geist.ttf" });

  return (
    <PDFDownloadLink
      document={
        <Document>
          <Page size="A4" style={{ padding: 30, fontFamily: "Geist" }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
                width: "100%",
                fontSize: 10,
                paddingHorizontal: 20,
              }}
            >
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Text>Regd By Government of India</Text>
                <Text>Reg No - 25/2024</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Text>Mobile: +91 95009 69977</Text>
                <Text>Email: tirunelvelieconomicchamber@gmail.com</Text>
                <Text>
                  Website:{" "}
                  <Link href="https://www.tirunelvelieconomicchamber.com">
                    tirunelvelieconomicchamber.com
                  </Link>
                </Text>
              </View>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
                fontSize: 12,
                gap: 20,
                padding: 20,
              }}
            >
              <Image
                src="/logomark.png"
                style={{
                  width: 40,
                  height: 40,
                }}
              />
              <View style={{ display: "flex", flexDirection: "column" }}>
                <Text>Tirunelveli Economic Chamber Trust</Text>
                <Text>17C/4 South Mount Road, Raja Tower 2nd floor</Text>
                <Text>Tirunelveli Town - 627006</Text>
              </View>
            </View>
            <View
              style={{
                alignSelf: "center",
                fontSize: 14,
                border: "1px solid black",
                padding: 8,
                width: "40%",
              }}
            >
              <Text
                style={{
                  textAlign: "center",
                }}
              >
                Membership Receipt
              </Text>
            </View>
            <View
              style={{
                fontSize: 12,
                padding: 20,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text>Receipt No: {receiptNumber}</Text>
              <Text>Date: {new Date(date).toLocaleDateString(["en-IN"])}</Text>
            </View>
            <View
              style={{
                fontSize: 14,
                paddingHorizontal: 20,
                paddingVertical: 10,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              <Text>Business Name/Person Name: {name}</Text>
              <Text>Phone Number: {phone}</Text>
              <Text>Address: {address}</Text>
              <Text>Amount: {amount}</Text>
            </View>
            <View
              style={{
                fontSize: 14,
                paddingHorizontal: 20,
                paddingVertical: 10,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{
                  display: "flex",
                  gap: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    border: "1px solid black",
                    width: 10,
                    height: 10,
                    backgroundColor: wing === "Business" ? "black" : "white",
                  }}
                ></View>
                <Text>Business Wing</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  gap: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    border: "1px solid black",
                    width: 10,
                    height: 10,
                    backgroundColor: wing === "Social" ? "black" : "white",
                  }}
                ></View>
                <Text>Social Wing</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  gap: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    border: "1px solid black",
                    width: 10,
                    height: 10,
                    backgroundColor: wing === "Education" ? "black" : "white",
                  }}
                ></View>
                <Text>Education Wing</Text>
              </View>
              <View
                style={{
                  display: "flex",
                  gap: 5,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    border: "1px solid black",
                    width: 10,
                    height: 10,
                    backgroundColor: wing === "Spiritual" ? "black" : "white",
                  }}
                ></View>
                <Text>Spiritual Wing</Text>
              </View>
            </View>
            <View
              style={{
                fontSize: 16,
                padding: 20,
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  border: "1px solid black",
                  padding: 10,
                }}
              >
                Rs {amount} /-
              </Text>
              <View
                style={{
                  fontSize: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 5,
                }}
              >
                <Text>Collected By</Text>
                <Text>TEC Trust</Text>
              </View>
            </View>
          </Page>
        </Document>
      }
      fileName={`receipt-${receiptNumber}.pdf`}
    >
      {({ loading }) => <Button disabled={loading}>Download</Button>}
    </PDFDownloadLink>
  );
}
