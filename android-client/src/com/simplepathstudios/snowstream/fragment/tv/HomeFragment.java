package com.simplepathstudios.snowstream.fragment.tv;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.Observer;
import androidx.lifecycle.ViewModelProvider;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;

import com.simplepathstudios.snowstream.MobileActivity;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.Util;
import com.simplepathstudios.snowstream.adapter.ShelfListAdapter;
import com.simplepathstudios.snowstream.api.model.Shelf;
import com.simplepathstudios.snowstream.viewmodel.ShelfListViewModel;

import java.util.List;

public class HomeFragment extends Fragment {
   private ShelfListViewModel shelfListViewModel;
   private RecyclerView shelfListElement;
   private LinearLayoutManager shelfListLayoutManager;
   private ShelfListAdapter shelfListAdapter;
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                            @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.mobile_home_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);
      shelfListElement = view.findViewById(R.id.shelf_list);
      shelfListAdapter = new ShelfListAdapter();
      shelfListElement.setAdapter(shelfListAdapter);
      shelfListLayoutManager = new LinearLayoutManager(getActivity());
      shelfListElement.setLayoutManager(shelfListLayoutManager);
      shelfListViewModel = Util.getApp().getViewModel(ShelfListViewModel.class);
      shelfListViewModel.Data.observe(getViewLifecycleOwner(), new Observer<List<Shelf>>() {
         @Override
         public void onChanged(List<Shelf> shelfList) {
            shelfListAdapter.setData(shelfList);
            shelfListAdapter.notifyDataSetChanged();
         }
      });
      shelfListViewModel.load();
   }
}
