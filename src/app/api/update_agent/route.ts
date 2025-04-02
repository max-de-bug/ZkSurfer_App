import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        // Expect the client to send JSON data with the following keys:
        // - user_id: string
        // - pdf_files: string[] (base64-encoded PDFs)
        // - image_file: string (base64-encoded image)
        // - url: string
        const data = await req.json();
        const { user_id, pdf_files, image_file, url } = data;

        if (!user_id) {
            return NextResponse.json(
                { error: "user_id is required" },
                { status: 400 }
            );
        }

        const results: Record<string, any> = {};

        // --- PDF Upload ---
        // if (pdf_files && Array.isArray(pdf_files) && pdf_files.length > 0) {
        //     const pdfEndpoint = `http://103.231.86.182:5000/add_pdfs/?user_id=${user_id}`;
        //     const pdfRes = await fetch(pdfEndpoint, {
        //         method: "POST",
        //         headers: { "Content-Type": "application/json" },
        //         body: JSON.stringify({ files: pdf_files }),
        //     });

        //     if (!pdfRes.ok) {
        //         results.pdf = { success: false, error: "Failed to upload PDFs" };
        //     } else {
        //         const pdfData = await pdfRes.json();
        //         results.pdf = { success: true, data: pdfData };
        //     }
        // }

        if (pdf_files && Array.isArray(pdf_files) && pdf_files.length > 0) {
            const pdfEndpoint = `http://103.231.86.182:5000/add_pdfs/?user_id=${user_id}`;
            const formData = new FormData();

            // Convert each base64 string to a File object with type 'application/pdf'
            for (const [index, pdfBase64] of pdf_files.entries()) {
                // Remove any data URL prefix if present.
                const base64Data = pdfBase64.includes(',')
                    ? pdfBase64.split(',')[1]
                    : pdfBase64;
                // Convert the base64 string to a Buffer.
                const buffer = Buffer.from(base64Data, 'base64');
                // Create a File object. (Available in Node 18+ or in the Edge runtime)
                const file = new File([buffer], `file_${index}.pdf`, { type: 'application/pdf' });
                formData.append("files", file);
            }

            const pdfRes = await fetch(pdfEndpoint, {
                method: "POST",
                headers: {
                    "Accept": "application/json"
                    // Note: Do not set "Content-Type" manually when using FormData.
                },
                body: formData,
            });

            if (!pdfRes.ok) {
                results.pdf = { success: false, error: "Failed to upload PDFs" };
            } else {
                const pdfData = await pdfRes.json();
                results.pdf = { success: true, data: pdfData };
            }
        }

        // --- Image Upload ---
        if (image_file) {
            const imageEndpoint = `http://103.231.86.182:5000/add_image/?user_id=${user_id}`;
            const imageRes = await fetch(imageEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ file: image_file }),
            });

            if (!imageRes.ok) {
                results.image = { success: false, error: "Failed to upload image" };
            } else {
                const imageData = await imageRes.json();
                results.image = { success: true, data: imageData };
            }
        }

        // --- URL Submission ---
        if (url && url.trim() !== "") {
            const urlEndpoint = `http://103.231.86.182:5000/add_link/?user_id=${user_id}`;
            const urlRes = await fetch(urlEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({ url: url.trim() }).toString(),
            });

            if (!urlRes.ok) {
                results.url = { success: false, error: "Failed to add URL" };
            } else {
                const urlData = await urlRes.json();
                results.url = { success: true, data: urlData };
            }
        }

        // Aggregate and return the results
        return NextResponse.json({ success: true, results });
    } catch (error) {
        console.error("Error in update_agent route:", error);
        return NextResponse.json(
            { error: "Something went wrong while processing the request" },
            { status: 500 }
        );
    }
}
