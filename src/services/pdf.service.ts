
import PDFDocument from "pdfkit";
import { Proposal, ProposalItem } from "@prisma/client";

export class PdfService {
  static generateProposalPdf(
    proposal: Proposal & { items: ProposalItem[] },
    dataCallback: (chunk: Buffer) => void,
    endCallback: () => void
  ) {
    const doc = new PDFDocument({ margin: 50 });

    doc.on("data", dataCallback);
    doc.on("end", endCallback);

    this.generateHeader(doc, proposal);
    this.generateClientInfo(doc, proposal);
    this.generateTable(doc, proposal);
    this.generateFooter(doc);

    doc.end();
  }

  private static generateHeader(doc: PDFKit.PDFDocument, proposal: Proposal) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("PROPOSAL", 50, 57)
      .fontSize(10)
      .text(`Proposal Number: ${proposal.proposalNo}`, 200, 50, { align: "right" })
      .text(`Date: ${new Date().toLocaleDateString()}`, 200, 65, { align: "right" })
      .text(`Status: ${proposal.status}`, 200, 80, { align: "right" })
      .moveDown();
      
      // Divider
      doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, 100).lineTo(550, 100).stroke();
  }

  private static generateClientInfo(doc: PDFKit.PDFDocument, proposal: Proposal) {
    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Client Details", 50, 130);

    doc.fontSize(10).text(`Name: ${proposal.clientName}`, 50, 160);
    if (proposal.clientEmail) doc.text(`Email: ${proposal.clientEmail}`, 50, 175);
    if (proposal.clientPhone) doc.text(`Phone: ${proposal.clientPhone}`, 50, 190);

    doc.moveDown();
  }

  private static generateTable(doc: PDFKit.PDFDocument, proposal: Proposal & { items: ProposalItem[] }) {
    let i;
    const invoiceTableTop = 250;

    doc.font("Helvetica-Bold");
    this.generateTableRow(
      doc,
      invoiceTableTop,
      "Item",
      "Description",
      "Unit Price",
      "Quantity",
      "Total"
    );
    doc.font("Helvetica");

    // Divider below header
    this.generateHr(doc, invoiceTableTop + 20);

    let position = 0;
    
    for (i = 0; i < proposal.items.length; i++) {
        const item = proposal.items[i];
         position = invoiceTableTop + (i + 1) * 30;
        this.generateTableRow(
            doc,
            position,
            (i+1).toString(),
            item.description,
            this.formatCurrency(Number(item.unitPrice)),
            item.quantity.toString(),
            this.formatCurrency(Number(item.total))
        );
        this.generateHr(doc, position + 20);
    }
    
    const subtotalPosition = position + 30;
    doc.font("Helvetica-Bold");
    this.generateTableRow(
        doc,
        subtotalPosition,
        "",
        "",
        "Total Amount",
        "",
        this.formatCurrency(Number(proposal.totalAmount))
    );
     doc.font("Helvetica");

  }

  private static generateFooter(doc: PDFKit.PDFDocument) {
    doc
      .fontSize(12)
      .text("Terms and Conditions", 50, 500, { underline: true });
      
    doc
        .fontSize(10)
        .text(
            "1. Validity: This proposal is valid for 30 days from the date of issue.\n" +
            "2. Payment Terms: 50% advance payment is required to commence work.\n" +
            "3. Timeline: The timeline is an estimate and may vary strictly based on project requirements.\n" +
            "4. Revisions: Two rounds of revisions are included in the quoted price.\n" +
            "5. Confidentiality: Both parties agree to maintain strict confidentiality regarding project details.", 
            50, 
            520,
            { align: "left", width: 500 }
        );
        
    doc
        .fontSize(10)
        .text(
            "Thank you for your business.",
            50,
            700,
            { align: "center", width: 500 }
        );
  }

  private static generateTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    item: string,
    description: string,
    unitCost: string,
    quantity: string,
    lineTotal: string
  ) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 100, y)
      .text(unitCost, 280, y, { width: 90, align: "right" })
      .text(quantity, 370, y, { width: 90, align: "right" })
      .text(lineTotal, 0, y, { align: "right" });
  }

  private static generateHr(doc: PDFKit.PDFDocument, y: number) {
    doc
      .strokeColor("#aaaaaa")
      .lineWidth(1)
      .moveTo(50, y)
      .lineTo(550, y)
      .stroke();
  }

  private static formatCurrency(amount: number) {
    return "$" + (amount).toFixed(2);
  }
}
