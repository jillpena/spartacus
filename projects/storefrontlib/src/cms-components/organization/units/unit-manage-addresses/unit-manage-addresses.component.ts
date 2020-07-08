import { Component, OnInit, TemplateRef } from '@angular/core';
import { filter, map, switchMap, take, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';

import {
  RoutingService,
  EntitiesModel,
  OrgUnitService,
  B2BAddress,
  RouterState,
} from '@spartacus/core';
import { Params } from '@angular/router';
import { ListingModel } from '../../abstract-component/abstract-listing.component';
import { ICON_TYPE } from './../../../misc/icon/icon.model';
import { ModalService } from './../../../../shared/components/modal/modal.service';

@Component({
  selector: 'cx-unit-manage-addresses',
  templateUrl: './unit-manage-addresses.component.html',
})
export class UnitManageAddressesComponent implements OnInit {
  code: string;
  data$: Observable<Partial<ListingModel>>;
  cxRoute = 'orgUnitManageAddresses';
  ICON_TYPE = ICON_TYPE;
  addressId: string;

  constructor(
    protected routingService: RoutingService,
    protected orgUnitsService: OrgUnitService,
    protected modalService: ModalService
  ) {}

  private params$: Observable<
    Params
  > = this.routingService
    .getRouterState()
    .pipe(map((routingData: RouterState) => routingData.state.params));

  code$: Observable<string> = this.params$.pipe(
    map((params: Params) => params['code'])
  );

  ngOnInit(): void {
    this.code$.pipe(take(1)).subscribe((code) => (this.code = code));
    this.data$ = this.code$.pipe(
      tap((code) => this.orgUnitsService.loadAddresses(code)),
      switchMap((code) =>
        this.orgUnitsService.getAddresses(code).pipe(
          filter(Boolean),
          map((addresses: EntitiesModel<B2BAddress>) => ({
            values: addresses?.values.filter(Boolean).map((address) => ({
              id: address.id,
              code,
              name: `${address.firstName} ${address.lastName}`,
              formattedAddress: address.formattedAddress,
            })),
          }))
        )
      )
    );
  }

  openModal({ row }, template: TemplateRef<any>): void {
    this.addressId = row.id;
    this.modalService.open(template, {
      centered: true,
    });
  }

  deleteAddress() {
    this.code$
      .pipe(take(1))
      .subscribe((code) =>
        this.orgUnitsService.deleteAddress(code, this.addressId)
      );
  }
}
