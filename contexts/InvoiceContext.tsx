"use client";

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";

import { useRouter } from "next/navigation";

// RHF
import { useFormContext } from "react-hook-form";

// Hooks
import useToasts from "@/hooks/useToasts";

// Services
import { exportInvoice } from "@/services/invoice/client/exportInvoice";

// Variables
import {
    FORM_DEFAULT_VALUES,
    GENERATE_PDF_API,
    SEND_PDF_API,
    SHORT_DATE_OPTIONS,
} from "@/lib/variables";

// Types
import { ExportTypes, InvoiceType } from "@/types";
import { PackingListType } from "@/lib/schemas/packingList";

const defaultInvoiceContext = {
    invoicePdf: new Blob(),
    invoicePdfLoading: false,
    packingListPdf: new Blob(),
    packingListPdfLoading: false,
    packingListData: null as PackingListType | null,
    savedInvoices: [] as InvoiceType[],
    pdfUrl: null as string | null,
    packingListPdfUrl: null as string | null,
    activeTab: "invoice" as "invoice" | "packing-list",
    onFormSubmit: (values: InvoiceType) => {},
    newInvoice: () => {},
    generatePdf: async (data: InvoiceType) => {},
    generatePackingListPdf: async (data: PackingListType) => {},
    removeFinalPdf: () => {},
    removePackingListPdf: () => {},
    downloadPdf: () => {},
    downloadPackingListPdf: () => {},
    printPdf: () => {},
    printPackingListPdf: () => {},
    previewPdfInTab: () => {},
    previewPackingListPdfInTab: () => {},
    setActiveTab: (tab: "invoice" | "packing-list") => {},
    saveInvoice: () => {},
    deleteInvoice: (index: number) => {},
    sendPdfToMail: (email: string): Promise<void> => Promise.resolve(),
    sendPackingListPdfToMail: (email: string): Promise<void> => Promise.resolve(),
    exportInvoiceAs: (exportAs: ExportTypes) => {},
    importInvoice: (file: File) => {},
    setPackingListData: (data: PackingListType | null) => {},
};

export const InvoiceContext = createContext(defaultInvoiceContext);

export const useInvoiceContext = () => {
    return useContext(InvoiceContext);
};

type InvoiceContextProviderProps = {
    children: React.ReactNode;
};

export const InvoiceContextProvider = ({
    children,
}: InvoiceContextProviderProps) => {
  const router = useRouter();

  // Toasts
  const {
    newInvoiceSuccess,
    pdfGenerationSuccess,
    saveInvoiceSuccess,
    modifiedInvoiceSuccess,
    sendPdfSuccess,
    sendPdfError,
    importInvoiceError,
  } = useToasts();

  // Get form values and methods from form context
  const { getValues, reset } = useFormContext<InvoiceType>();

  // Variables
  const [invoicePdf, setInvoicePdf] = useState<Blob>(new Blob());
  const [invoicePdfLoading, setInvoicePdfLoading] = useState<boolean>(false);
  const [packingListPdf, setPackingListPdf] = useState<Blob>(new Blob());
  const [packingListPdfLoading, setPackingListPdfLoading] = useState<boolean>(false);
  const [packingListData, setPackingListData] = useState<PackingListType | null>(null);
  const [activeTab, setActiveTab] = useState<"invoice" | "packing-list">("invoice");

  // Saved invoices
  const [savedInvoices, setSavedInvoices] = useState<InvoiceType[]>([]);

  useEffect(() => {
    let savedInvoicesDefault;
    if (typeof window !== undefined) {
      // Saved invoices variables
            const savedInvoicesJSON =
                window.localStorage.getItem("savedInvoices");
      savedInvoicesDefault = savedInvoicesJSON
        ? JSON.parse(savedInvoicesJSON)
        : [];
      setSavedInvoices(savedInvoicesDefault);
    }
  }, []);

  // Get pdf url from blob
  const pdfUrl = useMemo(() => {
    if (invoicePdf.size > 0) {
      return window.URL.createObjectURL(invoicePdf);
    }
    return null;
  }, [invoicePdf]);

  // Get packing list pdf url from blob
  const packingListPdfUrl = useMemo(() => {
    if (packingListPdf.size > 0) {
      return window.URL.createObjectURL(packingListPdf);
    }
    return null;
  }, [packingListPdf]);

  /**
   * Handles form submission.
   *
   * @param {InvoiceType} data - The form values used to generate the PDF.
   */
  const onFormSubmit = (data: InvoiceType) => {
    console.log("VALUE");
    console.log(data);

    // Call generate pdf method
    generatePdf(data);
  };

  /**
   * Generates a new invoice.
   */
  const newInvoice = () => {
    reset(FORM_DEFAULT_VALUES);
    setInvoicePdf(new Blob());
    setPackingListPdf(new Blob());
    setPackingListData(null);
    setActiveTab("invoice");

    router.refresh();

    // Toast
    newInvoiceSuccess();
  };

  /**
   * Generate a PDF document based on the provided data.
   *
   * @param {InvoiceType} data - The data used to generate the PDF.
   * @returns {Promise<void>} - A promise that resolves when the PDF is successfully generated.
   * @throws {Error} - If an error occurs during the PDF generation process.
   */
  const generatePdf = useCallback(async (data: InvoiceType) => {
    setInvoicePdfLoading(true);

    try {
      const response = await fetch(GENERATE_PDF_API, {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.blob();
      setInvoicePdf(result);

      if (result.size > 0) {
        // Toast
        pdfGenerationSuccess();
      }
    } catch (err) {
      console.log(err);
    } finally {
      setInvoicePdfLoading(false);
    }
  }, []);

  /**
   * Generate a packing list PDF document based on the provided data.
   *
   * @param {PackingListType} data - The data used to generate the packing list PDF.
   * @returns {Promise<void>} - A promise that resolves when the PDF is successfully generated.
   * @throws {Error} - If an error occurs during the PDF generation process.
   */
  const generatePackingListPdf = useCallback(async (data: PackingListType) => {
    setPackingListPdfLoading(true);

    try {
      const response = await fetch("/api/packing-list/generate", {
        method: "POST",
        body: JSON.stringify(data),
      });

      const result = await response.blob();
      setPackingListPdf(result);
      setPackingListData(data);

      if (result.size > 0) {
        // Toast
        pdfGenerationSuccess();
        // Switch to packing list tab
        setActiveTab("packing-list");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setPackingListPdfLoading(false);
    }
  }, []);

  /**
   * Removes the final PDF file and switches to Live Preview
   */
  const removeFinalPdf = () => {
    setInvoicePdf(new Blob());
  };

  /**
   * Removes the packing list PDF file
   */
  const removePackingListPdf = () => {
    setPackingListPdf(new Blob());
    setPackingListData(null);
  };

  /**
   * Generates a preview of a PDF file and opens it in a new browser tab.
   */
  const previewPdfInTab = () => {
    if (invoicePdf) {
      const url = window.URL.createObjectURL(invoicePdf);
      window.open(url, "_blank");
    }
  };

  /**
   * Downloads a PDF file.
   */
  const downloadPdf = () => {
    // Only download if there is an invoice
    if (invoicePdf instanceof Blob && invoicePdf.size > 0) {
      // Create a blob URL to trigger the download
      const url = window.URL.createObjectURL(invoicePdf);

      // Create an anchor element to initiate the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "invoice.pdf";
      document.body.appendChild(a);

      // Trigger the download
      a.click();

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    }
  };

  /**
   * Downloads packing list PDF file.
   */
  const downloadPackingListPdf = () => {
    // Only download if there is a packing list
    if (packingListPdf instanceof Blob && packingListPdf.size > 0) {
      // Create a blob URL to trigger the download
      const url = window.URL.createObjectURL(packingListPdf);

      // Create an anchor element to initiate the download
      const a = document.createElement("a");
      a.href = url;
      a.download = "packing-list.pdf";
      document.body.appendChild(a);

      // Trigger the download
      a.click();

      // Clean up the URL object
      window.URL.revokeObjectURL(url);
    }
  };

  /**
   * Prints a PDF file.
   */
  const printPdf = () => {
    if (invoicePdf) {
      const pdfUrl = URL.createObjectURL(invoicePdf);
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  /**
   * Prints packing list PDF file.
   */
  const printPackingListPdf = () => {
    if (packingListPdf) {
      const pdfUrl = URL.createObjectURL(packingListPdf);
      const printWindow = window.open(pdfUrl, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
    }
  };

  /**
   * Generates a preview of packing list PDF file and opens it in a new browser tab.
   */
  const previewPackingListPdfInTab = () => {
    if (packingListPdf) {
      const url = window.URL.createObjectURL(packingListPdf);
      window.open(url, "_blank");
    }
  };

  // TODO: Change function name. (saveInvoiceData maybe?)
  /**
   * Saves the invoice data to local storage.
   */
  const saveInvoice = () => {
    if (invoicePdf) {
      // If get values function is provided, allow to save the invoice
      if (getValues) {
        // Retrieve the existing array from local storage or initialize an empty array
        const savedInvoicesJSON = localStorage.getItem("savedInvoices");
        const savedInvoices = savedInvoicesJSON
          ? JSON.parse(savedInvoicesJSON)
          : [];

        const updatedDate = new Date().toLocaleDateString(
          "en-US",
          SHORT_DATE_OPTIONS
        );

        const formValues = getValues();
        formValues.details.updatedAt = updatedDate;

        const existingInvoiceIndex = savedInvoices.findIndex(
          (invoice: InvoiceType) => {
            return (
                            invoice.details.invoiceNumber ===
                            formValues.details.invoiceNumber
            );
          }
        );

        // If invoice already exists
        if (existingInvoiceIndex !== -1) {
          savedInvoices[existingInvoiceIndex] = formValues;

          // Toast
          modifiedInvoiceSuccess();
        } else {
          // Add the form values to the array
          savedInvoices.push(formValues);

          // Toast
          saveInvoiceSuccess();
        }

                localStorage.setItem(
                    "savedInvoices",
                    JSON.stringify(savedInvoices)
                );

        setSavedInvoices(savedInvoices);
      }
    }
  };

  // TODO: Change function name. (deleteInvoiceData maybe?)
  /**
   * Delete an invoice from local storage based on the given index.
   *
   * @param {number} index - The index of the invoice to be deleted.
   */
  const deleteInvoice = (index: number) => {
    if (index >= 0 && index < savedInvoices.length) {
      const updatedInvoices = [...savedInvoices];
      updatedInvoices.splice(index, 1);
      setSavedInvoices(updatedInvoices);

      const updatedInvoicesJSON = JSON.stringify(updatedInvoices);

      localStorage.setItem("savedInvoices", updatedInvoicesJSON);
    }
  };

  /**
   * Send the invoice PDF to the specified email address.
   *
   * @param {string} email - The email address to which the Invoice PDF will be sent.
   * @returns {Promise<void>} A promise that resolves once the email is successfully sent.
   */
  const sendPdfToMail = (email: string) => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("invoicePdf", invoicePdf, "invoice.pdf");
    fd.append("invoiceNumber", getValues().details.invoiceNumber);

    return fetch(SEND_PDF_API, {
      method: "POST",
      body: fd,
    })
      .then((res) => {
        if (res.ok) {
          // Successful toast msg
          sendPdfSuccess();
        } else {
          // Error toast msg
          sendPdfError({ email, sendPdfToMail });
        }
      })
      .catch((error) => {
        console.log(error);

        // Error toast msg
        sendPdfError({ email, sendPdfToMail });
      });
  };

  /**
   * Send the packing list PDF to the specified email address.
   *
   * @param {string} email - The email address to which the packing list PDF will be sent.
   * @returns {Promise<void>} A promise that resolves once the email is successfully sent.
   */
  const sendPackingListPdfToMail = (email: string) => {
    const fd = new FormData();
    fd.append("email", email);
    fd.append("packingListPdf", packingListPdf, "packing-list.pdf");
    fd.append("packingListNumber", packingListData?.packingListNumber || "");

    return fetch(SEND_PDF_API, {
      method: "POST",
      body: fd,
    })
      .then((res) => {
        if (res.ok) {
          // Successful toast msg
          sendPdfSuccess();
        } else {
          // Error toast msg
          sendPdfError({ email, sendPdfToMail: sendPackingListPdfToMail });
        }
      })
      .catch((error) => {
        console.log(error);

        // Error toast msg
        sendPdfError({ email, sendPdfToMail: sendPackingListPdfToMail });
      });
  };

  /**
   * Export an invoice in the specified format using the provided form values.
   *
   * This function initiates the export process with the chosen export format and the form data.
   *
   * @param {ExportTypes} exportAs - The format in which to export the invoice.
   */
  const exportInvoiceAs = (exportAs: ExportTypes) => {
    const formValues = getValues();

    // Service to export invoice with given parameters
    exportInvoice(exportAs, formValues);
  };

  /**
   * Import an invoice from a JSON file.
   *
   * @param {File} file - The JSON file to import.
   */
  const importInvoice = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedData = JSON.parse(event.target?.result as string);

        // Parse the dates
        if (importedData.details) {
          if (importedData.details.invoiceDate) {
            importedData.details.invoiceDate = new Date(
              importedData.details.invoiceDate
            );
          }
          if (importedData.details.dueDate) {
            importedData.details.dueDate = new Date(
              importedData.details.dueDate
            );
          }
        }

        // Reset form with imported data
        reset(importedData);
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        importInvoiceError();
      }
    };
    reader.readAsText(file);
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoicePdf,
        invoicePdfLoading,
        packingListPdf,
        packingListPdfLoading,
        packingListData,
        savedInvoices,
        pdfUrl,
        packingListPdfUrl,
        activeTab,
        onFormSubmit,
        newInvoice,
        generatePdf,
        generatePackingListPdf,
        removeFinalPdf,
        removePackingListPdf,
        downloadPdf,
        downloadPackingListPdf,
        printPdf,
        printPackingListPdf,
        previewPdfInTab,
        previewPackingListPdfInTab,
        setActiveTab,
        saveInvoice,
        deleteInvoice,
        sendPdfToMail,
        sendPackingListPdfToMail,
        exportInvoiceAs,
        importInvoice,
        setPackingListData,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};
