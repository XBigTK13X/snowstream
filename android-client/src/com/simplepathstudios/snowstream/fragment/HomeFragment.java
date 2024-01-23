package com.simplepathstudios.snowstream.fragment;

import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;
import androidx.fragment.app.Fragment;
import androidx.lifecycle.ViewModelProvider;

import com.simplepathstudios.snowstream.LoadingIndicator;
import com.simplepathstudios.snowstream.R;
import com.simplepathstudios.snowstream.viewmodel.SettingsViewModel;

public class HomeFragment extends Fragment {
   private SettingsViewModel settingsViewModel;
   @Override
   public View onCreateView(LayoutInflater inflater, @Nullable ViewGroup container,
                            @Nullable Bundle savedInstanceState) {
      return inflater.inflate(R.layout.home_fragment, container, false);
   }

   @Override
   public void onViewCreated(View view, @Nullable Bundle savedInstanceState) {
      super.onViewCreated(view, savedInstanceState);
      settingsViewModel = new ViewModelProvider(getActivity()).get(SettingsViewModel.class);
      settingsViewModel.Data.observe(getViewLifecycleOwner(),settings -> {
         if(settings.AuthToken == null){

         }
      });
      LoadingIndicator.setLoading(false);
   }
}
