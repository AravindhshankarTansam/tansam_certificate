import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-certificate',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './certificate.component.html',
  styleUrls: ['./certificate.component.css']
})
export class CertificateComponent {

  certificateData = {
    name: 'NETRA GUPTA',
    institution: 'SRM Institute of Technology',
    department: 'CINTEL',

    // ✅ Editable programme name
    programme: 'IoT Data Visualization and Dashboard',

    // ✅ Dates only used in content
    startDate: '2025-10-14',
    endDate: '2025-11-07',

    // ✅ Certificate number
    certificateNo: 'TCOE/112025/DT/028'
  };

}

