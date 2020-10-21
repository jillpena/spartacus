import { DebugElement } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { I18nTestingModule, Order } from '@spartacus/core';
import { Observable, of } from 'rxjs';
import { OrderDetailsService } from '../order-details.service';
import { OrderDetailApprovalDetailsComponent } from './order-detail-approval-details.component';

const mockOrder: Order = {
  permissionResults: [
    {
      approverName: 'Hanna Schmidt-1',
      permissionType: {
        code: 'B2BBudgetExceededPermission',
        name: 'Budget Exceeded Permission',
      },
      statusDisplay: 'Pending Approval-1',
      approverNotes: 'Notes-1',
    },
    {
      approverName: 'Hanna Schmidt-2',
      permissionType: {
        code: 'B2BOrderThresholdPermission',
        name: 'Allowed Order Threshold (per order)',
      },
      statusDisplay: 'Pending Approval-2',
      approverNotes: 'Notes-2',
    },
    {
      approverName: 'Hanna Schmidt-3',
      permissionType: {
        code: 'B2BOrderThresholdPermission',
        name: 'Allowed Order Threshold (per order)',
      },
      statusDisplay: 'Pending Approval-3',
    },
  ],
} as Order;

class MockOrderDetailsService {
  getOrderDetails(): Observable<Order> {
    return of(mockOrder);
  }
}

describe('OrderDetailApprovalDetailsComponent', () => {
  let component: OrderDetailApprovalDetailsComponent;
  let fixture: ComponentFixture<OrderDetailApprovalDetailsComponent>;
  let element: DebugElement;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [I18nTestingModule],
      declarations: [OrderDetailApprovalDetailsComponent],
      providers: [
        { provide: OrderDetailsService, useClass: MockOrderDetailsService },
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderDetailApprovalDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    element = fixture.debugElement;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should read order details', () => {
    let order: Order;
    component.order$
      .subscribe((value) => {
        order = value;
      })
      .unsubscribe();
    expect(order).toEqual(mockOrder);
  });

  it('should display approval details in a table', () => {
    expect(element.queryAll(By.css('tr')).length).toEqual(
      mockOrder.permissionResults.length
    );

    for (let i = 0; i < mockOrder.permissionResults.length; i++) {
      expect(
        element.query(
          By.css(`tr:nth-of-type(${i + 1}) td.cx-approval-approverName`)
        ).nativeElement.innerText
      ).toContain(mockOrder.permissionResults[i].approverName);
      expect(
        element.query(
          By.css(`tr:nth-of-type(${i + 1}) td.cx-approval-statusDisplay`)
        ).nativeElement.innerText
      ).toContain(mockOrder.permissionResults[i].statusDisplay);

      expect(
        element.query(
          By.css(`tr:nth-of-type(${i + 1}) td.cx-approval-approvalNotes`)
        ).nativeElement.innerText
      ).toContain(
        mockOrder.permissionResults[i].approverNotes ||
          'orderDetails.approvalDetails.noApprovalNotes'
      );
    }
  });
});
