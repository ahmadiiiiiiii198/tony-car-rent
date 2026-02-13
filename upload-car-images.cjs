const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://xrfmsuoqkzkyhnvmgehv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhyZm1zdW9xa3preWhudm1nZWh2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA3MzcxNTEsImV4cCI6MjA4NjMxMzE1MX0.-Hl-5J-Pq-CmJdzUefDZptEp-5zzprtQF7dJtAZuJ94';

const supabase = createClient(supabaseUrl, supabaseKey);

const imageDir = 'C:\\Users\\39351\\Downloads\\Windsurf\\car_bg_edit';

const carMapping = [
  {
    dbId: 17,
    dbName: 'Range rover evoque',
    prefix: 'Range-Rover-Evoque',
    folder: 'range-rover-evoque',
    count: 7
  },
  {
    dbId: 18,
    dbName: 'Vw polo',
    prefix: 'VW-Polo',
    folder: 'vw-polo',
    count: 10
  },
  {
    dbId: null,
    dbName: 'Audi A4 S Line',
    prefix: 'Audi-A4-SLine',
    folder: 'audi-a4-sline',
    count: 10
  },
  {
    dbId: 19,
    dbName: 'Mercedes benz clk 200',
    prefix: 'Mercedes-CLK200',
    folder: 'mercedes-clk200',
    count: 7
  },
  {
    dbId: 20,
    dbName: 'Audi Q5',
    prefix: 'Audi-Q5',
    folder: 'audi-q5',
    count: 10
  }
];

async function uploadImages() {
  for (const car of carMapping) {
    console.log(`\nUploading images for ${car.dbName}...`);
    const uploadedUrls = [];

    for (let i = 1; i <= car.count; i++) {
      const filename = `${car.prefix}-${i}.jpg`;
      const filepath = path.join(imageDir, filename);

      if (!fs.existsSync(filepath)) {
        console.log(`  SKIP: ${filename} not found`);
        continue;
      }

      const fileBuffer = fs.readFileSync(filepath);
      const storagePath = `${car.folder}/${filename}`;

      const { data, error } = await supabase.storage
        .from('car-images')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.log(`  ERROR uploading ${filename}: ${error.message}`);
      } else {
        const publicUrl = `${supabaseUrl}/storage/v1/object/public/car-images/${storagePath}`;
        uploadedUrls.push(publicUrl);
        console.log(`  OK: ${filename}`);
      }
    }

    if (uploadedUrls.length > 0 && car.dbId) {
      const { error: updateError } = await supabase
        .from('cars')
        .update({
          image: uploadedUrls[0],
          images: uploadedUrls
        })
        .eq('id', car.dbId);

      if (updateError) {
        console.log(`  DB UPDATE ERROR for ${car.dbName}: ${updateError.message}`);
      } else {
        console.log(`  DB UPDATED: ${car.dbName} with ${uploadedUrls.length} images`);
      }
    } else if (uploadedUrls.length > 0) {
      console.log(`  URLS for ${car.dbName} (no dbId, manual update needed):`);
      uploadedUrls.forEach(u => console.log(`    ${u}`));
    }
  }

  console.log('\nDone!');
}

uploadImages().catch(console.error);
